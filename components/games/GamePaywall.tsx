'use client';

import React, { useState } from 'react';
import { GameConfig } from '@/lib/game-config';
import { Button } from '@/components/ui/Button';
import { X, CheckCircle, Zap } from 'lucide-react';

interface GamePaywallProps {
  gameId: string;
  gameConfig: GameConfig;
  reason: 'level_complete' | 'premium_game' | 'guest_session';
  sessionSummary?: {
    duration: number;
    level: number;
    score: number;
    achievements: string[];
  };
  onSubscribe: () => void;
  onSkip: () => void;
  onTryTrial: () => void;
}

const GamePaywall: React.FC<GamePaywallProps> = ({
  gameId,
  gameConfig,
  reason,
  sessionSummary,
  onSubscribe,
  onSkip,
  onTryTrial,
}) => {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onSkip, 300);
  };

  const getHeadline = (): { title: string; subtitle: string } => {
    switch (reason) {
      case 'premium_game':
        return {
          title: `Unlock ${gameConfig.title}`,
          subtitle: 'Join Likkle Legends Premium to play this exclusive game',
        };
      case 'level_complete':
        return {
          title: '🎉 Level Complete!',
          subtitle: 'Sign up to save your progress and unlock more levels',
        };
      case 'guest_session':
        return {
          title: '💾 Save Your Progress',
          subtitle: 'Create an account to keep your score and continue playing',
        };
    }
  };

  const headline = getHeadline();

  const benefits =
    reason === 'premium_game'
      ? [
          'Access 20+ premium games',
          'Personalized learning paths',
          'Ad-free experience',
          'Advanced progress tracking',
          'Family profiles for siblings',
        ]
      : [
          'Save all your progress',
          'Earn badges and rewards',
          'Compare scores on leaderboards',
          'Unlock premium games',
          'Personalized recommendations',
        ];

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center bg-black/40 z-50 p-4 transition-opacity duration-300 ${
        isClosing ? 'opacity-0' : 'opacity-100'
      }`}
      onClick={handleClose}
    >
      <div
        className={`relative bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 ${
          isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
        }`}
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition z-10"
          aria-label="Close"
        >
          <X size={20} className="text-gray-400" />
        </button>

        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-secondary p-8 text-white rounded-t-2xl">
          <div className="text-4xl mb-3">{gameConfig.icon}</div>
          <h2 className="text-2xl font-heading font-bold mb-2">{headline.title}</h2>
          <p className="text-white/90 text-sm">{headline.subtitle}</p>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Session Summary */}
          {sessionSummary && reason !== 'premium_game' && (
            <div className="mb-6 p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border border-primary/20">
              <h3 className="font-semibold text-gray-900 mb-3">Your Stats</h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{sessionSummary.level}</div>
                  <div className="text-xs text-gray-600">Level Reached</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-secondary">{sessionSummary.score}</div>
                  <div className="text-xs text-gray-600">Points</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-500">{sessionSummary.duration}m</div>
                  <div className="text-xs text-gray-600">Played</div>
                </div>
              </div>

              {sessionSummary.achievements.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-300">
                  <p className="text-xs font-semibold text-gray-700 mb-2">Achievements</p>
                  <div className="flex flex-wrap gap-2">
                    {sessionSummary.achievements.map(achievement => (
                      <span
                        key={achievement}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full"
                      >
                        <CheckCircle size={12} />
                        {achievement}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Benefits */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Premium Benefits</h3>
            <ul className="space-y-2">
              {benefits.map((benefit, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle
                    size={18}
                    className="text-secondary flex-shrink-0 mt-0.5"
                  />
                  <span className="text-sm text-gray-700">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pricing Info */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-900">Likkle Legends Premium</span>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                <Zap size={12} />
                Limited Offer
              </span>
            </div>
            <p className="text-xs text-gray-600">
              First month free, then $4.99/month. Cancel anytime.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={onSubscribe}
              variant="primary"
              className="shadow-lg w-full"
            >
              Start Free Trial
            </Button>

            <Button
              onClick={onTryTrial}
              variant="outline"
              className="w-full"
            >
              See Plans
            </Button>

            <button
              onClick={handleClose}
              className="w-full py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-full transition"
            >
              Continue as Guest
            </button>
          </div>

          {/* Trust Badges */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center mb-3">
              Trusted by parents & educators
            </p>
            <div className="flex items-center justify-center gap-2">
              <span className="inline-flex items-center gap-1 text-xs text-gray-600">
                <CheckCircle size={14} className="text-green-600" />
                Ad-free
              </span>
              <span className="text-gray-300">•</span>
              <span className="inline-flex items-center gap-1 text-xs text-gray-600">
                <CheckCircle size={14} className="text-green-600" />
                Safe
              </span>
              <span className="text-gray-300">•</span>
              <span className="inline-flex items-center gap-1 text-xs text-gray-600">
                <CheckCircle size={14} className="text-green-600" />
                Educational
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamePaywall;
