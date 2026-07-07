'use client';

import { useState, useCallback, useEffect } from 'react';
import confetti from 'canvas-confetti';

const RHYTHM_PATTERNS = [
  { beats: [1, 0, 1, 0], name: 'Basic', difficulty: 'easy' },
  { beats: [1, 1, 0, 1], name: 'Soca', difficulty: 'easy' },
  { beats: [1, 0, 1, 1, 0, 1], name: 'Reggae', difficulty: 'medium' },
  { beats: [1, 1, 1, 0, 1, 1], name: 'Calypso', difficulty: 'medium' },
  { beats: [1, 0, 1, 0, 1, 1, 0, 1], name: 'Steel Drum', difficulty: 'hard' },
  { beats: [1, 1, 0, 1, 1, 0, 1, 0], name: 'Dancehall', difficulty: 'hard' },
];

interface GameProps {
  onComplete?: (score: number) => void;
}

export default function RhythmMatcher({ onComplete }: GameProps) {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'playback' | 'input' | 'complete'>('start');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [currentPatternIndex, setCurrentPatternIndex] = useState(0);
  const [userPattern, setUserPattern] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [feedback, setFeedback] = useState<{ message: string; type: 'correct' | 'incorrect' | '' }>({ message: '', type: '' });
  const [playingPattern, setPlayingPattern] = useState(false);
  const [animatingBeat, setAnimatingBeat] = useState<number | null>(null);
  const [hint, setHint] = useState(false);

  const patterns = RHYTHM_PATTERNS.filter(p =>
    difficulty === 'easy' ? p.difficulty === 'easy' :
    difficulty === 'medium' ? p.difficulty !== 'hard' :
    true
  );

  const currentPattern = patterns[currentPatternIndex];
  const MAX_ROUNDS = 5;

  const playPatternAnimation = useCallback(async () => {
    setPlayingPattern(true);
    setAnimatingBeat(null);

    for (let i = 0; i < currentPattern.beats.length; i++) {
      if (currentPattern.beats[i] === 1) {
        await new Promise(resolve => {
          setTimeout(() => {
            setAnimatingBeat(i);
            resolve(null);
          }, i * 600);
        });

        await new Promise(resolve => {
          setTimeout(() => {
            setAnimatingBeat(null);
            resolve(null);
          }, i * 600 + 400);
        });
      } else {
        await new Promise(resolve => {
          setTimeout(() => resolve(null), 600);
        });
      }
    }

    setPlayingPattern(false);
    setTimeout(() => {
      setGameState('input');
      setUserPattern([]);
      setFeedback({ message: '', type: '' });
    }, 600);
  }, [currentPattern]);

  const startGame = useCallback(() => {
    setGameState('playback');
    setCurrentPatternIndex(0);
    setUserPattern([]);
    setScore(0);
    setRound(1);
    setFeedback({ message: '', type: '' });
    setHint(false);
    playPatternAnimation();
  }, [playPatternAnimation]);

  const handleBeatInput = useCallback((beatIndex: number) => {
    if (playingPattern || gameState !== 'input') return;

    const newPattern = [...userPattern, beatIndex];
    setUserPattern(newPattern);

    // Flash animation
    setAnimatingBeat(beatIndex);
    setTimeout(() => setAnimatingBeat(null), 200);

    // Check if beat is correct
    if (currentPattern.beats[newPattern.length - 1] === 0 || (currentPattern.beats[newPattern.length - 1] === 1 && beatIndex === newPattern.length - 1)) {
      // This is a simplified check - in a real rhythm game you'd validate more carefully
      if (newPattern.length === currentPattern.beats.length) {
        // Pattern complete
        setFeedback({ message: '✓ Perfect rhythm!', type: 'correct' });
        setScore(prev => prev + 100);

        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
        });

        setTimeout(() => {
          if (round < MAX_ROUNDS) {
            setRound(round + 1);
            setCurrentPatternIndex((currentPatternIndex + 1) % patterns.length);
            setUserPattern([]);
            setGameState('playback');
            setFeedback({ message: '', type: '' });
            setHint(false);
            playPatternAnimation();
          } else {
            setGameState('complete');
            if (onComplete) {
              onComplete(score + 100);
            }
          }
        }, 1500);
      }
    } else {
      // Wrong beat
      setFeedback({ message: '✗ Wrong beat! Try again.', type: 'incorrect' });
      setTimeout(() => {
        setUserPattern([]);
        setFeedback({ message: '', type: '' });
      }, 1000);
    }
  }, [userPattern, currentPattern, playingPattern, gameState, round, score, currentPatternIndex, patterns, playPatternAnimation, onComplete]);

  const handleHint = useCallback(() => {
    setHint(true);
    setTimeout(() => setHint(false), 4000);
  }, []);

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      minHeight: '100vh',
      background: 'linear-gradient(180deg, rgba(20, 30, 50, 0.8) 0%, rgba(30, 50, 80, 0.6) 100%)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '2rem 1rem',
      borderRadius: '1.5rem',
    }}>
      <style jsx>{`
        .beat-button {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          border: 3px solid;
          background: rgba(255, 82, 150, 0.1);
          color: #FF5296;
          font-size: 1.5rem;
          cursor: pointer;
          transition: all 0.2s ease;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .beat-button:hover:not(:disabled) {
          background: rgba(255, 82, 150, 0.25);
          border-color: rgba(255, 82, 150, 0.8);
          transform: scale(1.1);
        }
        .beat-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .beat-button.playing {
          background: rgba(255, 82, 150, 0.4);
          border-color: #FF5296;
          box-shadow: 0 0 20px rgba(255, 82, 150, 0.6);
          transform: scale(1.15);
        }
        .beat-button.beat-1 {
          border-color: rgba(255, 82, 150, 0.6);
        }
        .beat-button.beat-0 {
          border-color: rgba(46, 196, 182, 0.6);
          background: rgba(46, 196, 182, 0.1);
          color: #2EC4B6;
        }
        .beat-button.beat-0:hover:not(:disabled) {
          background: rgba(46, 196, 182, 0.25);
          border-color: rgba(46, 196, 182, 0.8);
        }
      `}</style>

      {gameState === 'start' && (
        <div style={{ textAlign: 'center', maxWidth: '600px' }}>
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            marginBottom: '1rem',
            background: 'linear-gradient(135deg, #FF5296, #FF69B4)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            🥁 Rhythm Matcher
          </h2>

          <p style={{
            fontSize: '1.1rem',
            color: '#8EA4C8',
            marginBottom: '2rem',
            lineHeight: '1.6',
          }}>
            Listen to Caribbean rhythm patterns and tap them out! Match the steel pan and drum beats!
          </p>

          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginBottom: '2rem',
          }}>
            {(['easy', 'medium', 'hard'] as const).map(level => (
              <button
                key={level}
                onClick={() => setDifficulty(level)}
                style={{
                  padding: '0.75rem 1.5rem',
                  fontSize: '1rem',
                  fontWeight: '600',
                  borderRadius: '0.75rem',
                  border: '2px solid',
                  borderColor: difficulty === level ? '#FF5296' : 'rgba(255, 82, 150, 0.3)',
                  background: difficulty === level ? 'rgba(255, 82, 150, 0.2)' : 'transparent',
                  color: '#FF5296',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  transition: 'all 0.2s ease',
                }}
              >
                {level === 'easy' && '⭐ Easy (4 beats)'}
                {level === 'medium' && '⭐⭐ Medium (6 beats)'}
                {level === 'hard' && '⭐⭐⭐ Hard (8 beats)'}
              </button>
            ))}
          </div>

          <button
            onClick={startGame}
            style={{
              padding: '1rem 2rem',
              fontSize: '1.2rem',
              fontWeight: '700',
              borderRadius: '1rem',
              border: 'none',
              background: 'linear-gradient(135deg, #FF5296, #FF69B4)',
              color: '#0A1628',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(255, 82, 150, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Start Game
          </button>
        </div>
      )}

      {(gameState === 'playback' || gameState === 'input') && (
        <div style={{ width: '100%', maxWidth: '600px', textAlign: 'center' }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '2rem',
            fontSize: '1.1rem',
            fontWeight: '600',
            color: '#FFD23F',
          }}>
            <div>Round: {round}/{MAX_ROUNDS}</div>
            <div>Score: {score}</div>
          </div>

          {/* Pattern Name & Status */}
          <div style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#FF5296',
            marginBottom: '1rem',
          }}>
            {currentPattern.name}
          </div>

          {gameState === 'playback' && (
            <div style={{
              color: '#8EA4C8',
              marginBottom: '2rem',
              fontSize: '1rem',
            }}>
              {playingPattern ? '🔊 Listening to rhythm...' : '🎧 Rhythm ready! Tap the buttons below.'}
            </div>
          )}

          {gameState === 'input' && (
            <div style={{
              color: '#2EC4B6',
              marginBottom: '2rem',
              fontSize: '1rem',
              fontWeight: '600',
            }}>
              Your turn! Tap the beats: {userPattern.length}/{currentPattern.beats.length}
            </div>
          )}

          {feedback.message && (
            <div style={{
              fontSize: '1.2rem',
              fontWeight: '600',
              marginBottom: '1rem',
              color: feedback.type === 'correct' ? '#69F0AE' : '#FF5252',
            }}>
              {feedback.message}
            </div>
          )}

          {/* Hint Display */}
          {hint && gameState === 'input' && (
            <div style={{
              background: 'rgba(46, 196, 182, 0.15)',
              border: '1px solid #2EC4B6',
              borderRadius: '0.75rem',
              padding: '1rem',
              marginBottom: '1.5rem',
              color: '#2EC4B6',
              fontSize: '0.9rem',
            }}>
              💡 Pattern: {currentPattern.beats.map(b => b === 1 ? '🥁' : '·').join(' ')}
            </div>
          )}

          {/* Beat Buttons */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem',
            padding: '2rem',
            background: 'rgba(0, 0, 0, 0.2)',
            borderRadius: '1rem',
          }}>
            {currentPattern.beats.map((beat, idx) => (
              <button
                key={idx}
                className={`beat-button beat-${beat} ${animatingBeat === idx ? 'playing' : ''}`}
                onClick={() => handleBeatInput(idx)}
                disabled={playingPattern || gameState !== 'input'}
              >
                {beat === 1 ? '🥁' : '·'}
              </button>
            ))}
          </div>

          {gameState === 'input' && (
            <div>
              <button
                onClick={handleHint}
                style={{
                  padding: '0.75rem 1.5rem',
                  fontSize: '1rem',
                  fontWeight: '600',
                  borderRadius: '0.75rem',
                  border: '2px solid rgba(46, 196, 182, 0.4)',
                  background: 'rgba(46, 196, 182, 0.1)',
                  color: '#2EC4B6',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                💡 Hint
              </button>
            </div>
          )}
        </div>
      )}

      {gameState === 'complete' && (
        <div style={{ textAlign: 'center', maxWidth: '600px' }}>
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            marginBottom: '1rem',
            background: 'linear-gradient(135deg, #FFD23F, #FF6B35)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            🎉 Rhythm Master!
          </h2>

          <div style={{
            fontSize: '3rem',
            fontWeight: '700',
            color: '#69F0AE',
            marginBottom: '1rem',
          }}>
            {score} XP
          </div>

          <p style={{
            fontSize: '1.1rem',
            color: '#8EA4C8',
            marginBottom: '2rem',
            lineHeight: '1.6',
          }}>
            Excellent! You've mastered Caribbean rhythms! You captured the spirit of soca, reggae, and steel drums! 🎵
          </p>

          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              fontWeight: '600',
              borderRadius: '0.75rem',
              border: 'none',
              background: 'linear-gradient(135deg, #FFD23F, #FF6B35)',
              color: '#0A1628',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(255, 210, 63, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
}