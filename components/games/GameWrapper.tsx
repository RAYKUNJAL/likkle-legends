'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  getGuestSession,
  updateGuestSession,
  endGuestSession,
  getSessionDuration,
  GameSession,
  initializeGuestSession,
} from '@/lib/guest-game-session';
import { getGameConfig, GameConfig } from '@/lib/game-config';
import { gameAnalyticsEvents } from '@/lib/analytics';

interface GameWrapperProps {
  gameId: string;
  gameIframeSrc?: string;
  onGameMessage?: (message: any) => void;
  userTier?: 'free' | 'premium' | 'unlimited';
  userId?: string;
}

interface GameMessage {
  type: 'level_complete' | 'score_update' | 'game_quit' | 'game_error';
  level?: number;
  score?: number;
  gameState?: Record<string, any>;
}

const GameWrapper: React.FC<GameWrapperProps> = ({
  gameId,
  gameIframeSrc,
  onGameMessage,
  userId,
}) => {
  const router = useRouter();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const sessionRef = useRef<GameSession | null>(null);

  const [gameConfig, setGameConfig] = useState<GameConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize game
  useEffect(() => {
    const config = getGameConfig(gameId);
    if (!config) {
      setError(`Game "${gameId}" not found`);
      setIsLoading(false);
      return;
    }

    setGameConfig(config);

    // Initialize session
    let gameSession = getGuestSession();
    if (!gameSession || gameSession.gameId !== gameId) {
      gameSession = initializeGuestSession(gameId);
    }

    sessionRef.current = gameSession;

    if (userId) {
      gameAnalyticsEvents.gameStarted(gameId, 'authenticated', userId);
    } else {
      gameAnalyticsEvents.gameStarted(gameId, 'guest', gameSession.id);
    }

    setIsLoading(false);
  }, [gameId, userId]);

  // Setup message listener for game iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Validate origin for security
      if (event.origin !== window.location.origin && !event.origin.includes('localhost')) {
        return;
      }

      const message = event.data as GameMessage;
      if (!message.type) return;

      if (!sessionRef.current) return;

      onGameMessage?.(message);

      switch (message.type) {
        case 'level_complete': {
          const newLevel = message.level || (sessionRef.current.level + 1);
          const updated = updateGuestSession(sessionRef.current.id, {
            level: newLevel,
            gameState: message.gameState,
          });

          if (updated) {
            sessionRef.current = updated;

            if (!userId) {
              gameAnalyticsEvents.gameLevelCompleted(gameId, newLevel, sessionRef.current.id);
            }
          }
          break;
        }

        case 'score_update': {
          const newScore = message.score || 0;
          const updated = updateGuestSession(sessionRef.current.id, {
            score: newScore,
          });

          if (updated) {
            sessionRef.current = updated;

            if (!userId) {
              gameAnalyticsEvents.gameScoreEarned(gameId, newScore, updated.level, sessionRef.current.id);
            }
          }
          break;
        }

        case 'game_quit': {
          if (!userId && sessionRef.current) {
            gameAnalyticsEvents.gameQuit(
              gameId,
              getSessionDuration(sessionRef.current),
              sessionRef.current.level,
              sessionRef.current.score,
              sessionRef.current.id
            );
            endGuestSession(sessionRef.current.id);
          }
          break;
        }

        case 'game_error': {
          console.error('Game error:', message);
          setError('An error occurred in the game. Please refresh and try again.');
          break;
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [gameId, userId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sessionRef.current && !userId) {
        endGuestSession(sessionRef.current.id);
      }
    };
  }, [userId]);

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="text-center">
          <div className="inline-block">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-secondary"></div>
          </div>
          <p className="mt-4 text-gray-600 font-heading">Loading {gameConfig?.title}...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-red-50">
        <div className="text-center max-w-md">
          <div className="text-4xl mb-4">⚠️</div>
          <h1 className="text-2xl font-heading font-bold text-red-700 mb-2">Something went wrong</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-2 bg-primary text-white rounded-full font-semibold hover:bg-orange-600 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!gameConfig) {
    return null;
  }

  return (
    <div className="relative w-full h-screen bg-white">
      {/* Game Container */}
      <div className="w-full h-full">
        {gameIframeSrc ? (
          <iframe
            ref={iframeRef}
            src={gameIframeSrc}
            title={gameConfig.title}
            className="w-full h-full border-none"
            allow="accelerometer; camera; gyroscope; picture-in-picture"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-pointer-lock"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <div className="text-6xl mb-4">{gameConfig.icon}</div>
              <h1 className="text-2xl font-heading font-bold mb-2">{gameConfig.title}</h1>
              <p className="text-gray-600">{gameConfig.description}</p>
              <p className="text-sm text-gray-500 mt-4">
                Game content not loaded. Please check game configuration.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameWrapper;
