'use client';

import { useState, useCallback, useEffect } from 'react';
import confetti from 'canvas-confetti';

const WORD_SETS = [
  {
    letters: ['M', 'A', 'N', 'G', 'O'],
    validWords: ['MANGO', 'MAN', 'AGO', 'MOA'],
    facts: 'Mangoes are the "king of fruits" and are grown in many Caribbean islands!',
  },
  {
    letters: ['C', 'O', 'C', 'O', 'N'],
    validWords: ['COCOA', 'COON', 'COO', 'CON'],
    facts: 'Cocoa is used to make chocolate, a favorite treat around the world!',
  },
  {
    letters: ['P', 'A', 'P', 'A', 'Y'],
    validWords: ['PAPAYA', 'PAP', 'PAY', 'YAP'],
    facts: 'Papayas are full of vitamins and grow well in tropical climates!',
  },
  {
    letters: ['B', 'A', 'N', 'A', 'N'],
    validWords: ['BANANA', 'BAN', 'ANA', 'NAN'],
    facts: 'Bananas grow in bunches and are an excellent source of potassium!',
  },
  {
    letters: ['P', 'I', 'N', 'E', 'A'],
    validWords: ['PINE', 'PAN', 'PEA', 'NAP', 'PANE'],
    facts: 'Pineapples have a tough outer skin but sweet fruit inside!',
  },
  {
    letters: ['O', 'K', 'R', 'A', 'H'],
    validWords: ['OKRA', 'ARK', 'OAK', 'HAR', 'OAR'],
    facts: 'Okra is a green vegetable popular in Caribbean cuisine!',
  },
];

interface GameProps {
  onComplete?: (score: number) => void;
}

export default function WordBuilder({ onComplete }: GameProps) {
  const [gameState, setGameState] = useState<'playing' | 'complete'>('playing');
  const [roundIndex, setRoundIndex] = useState(0);
  const [formedWord, setFormedWord] = useState<string[]>([]);
  const [foundWords, setFoundWords] = useState<Set<string>>(new Set());
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<{ message: string; type: 'correct' | 'invalid' | '' }>({ message: '', type: '' });
  const [availableLetters, setAvailableLetters] = useState<string[]>([]);
  const [currentSet, setCurrentSet] = useState(WORD_SETS[0]);
  const [showFact, setShowFact] = useState(false);

  useEffect(() => {
    const shuffled = currentSet.letters.sort(() => Math.random() - 0.5);
    setAvailableLetters(shuffled);
  }, [currentSet]);

  const handleLetterClick = useCallback((index: number) => {
    const newFormed = [...formedWord, availableLetters[index]];
    setFormedWord(newFormed);
    setFeedback({ message: '', type: '' });
  }, [formedWord, availableLetters]);

  const handleBackspace = useCallback(() => {
    setFormedWord(formedWord.slice(0, -1));
    setFeedback({ message: '', type: '' });
  }, [formedWord]);

  const handleSubmit = useCallback(() => {
    const word = formedWord.join('');

    if (word.length < 3) {
      setFeedback({ message: 'Word must be at least 3 letters!', type: 'invalid' });
      return;
    }

    if (foundWords.has(word)) {
      setFeedback({ message: 'Already found that word!', type: 'invalid' });
      return;
    }

    if (currentSet.validWords.includes(word)) {
      // Correct word!
      const newFound = new Set([...foundWords, word]);
      setFoundWords(newFound);
      setFormedWord([]);
      setScore(prev => prev + 100);

      if (newFound.size === 3) {
        // Found 3 words, move to next round
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });

        setFeedback({ message: '⭐ Excellent! 3 words found!', type: 'correct' });

        if (roundIndex < WORD_SETS.length - 1) {
          setTimeout(() => {
            setRoundIndex(roundIndex + 1);
            setCurrentSet(WORD_SETS[roundIndex + 1]);
            setFoundWords(new Set());
            setFormedWord([]);
            setShowFact(false);
          }, 2000);
        } else {
          setTimeout(() => {
            setGameState('complete');
            if (onComplete) {
              onComplete(score + 100);
            }
          }, 2000);
        }
      } else {
        setFeedback({ message: '✓ Great! Keep going!', type: 'correct' });
      }
    } else {
      setFeedback({ message: `Not in word list. Try again!`, type: 'invalid' });
      setTimeout(() => {
        setFormedWord([]);
      }, 1000);
    }
  }, [formedWord, foundWords, currentSet, roundIndex, score, onComplete]);

  const handleHint = useCallback(() => {
    setShowFact(true);
    setTimeout(() => setShowFact(false), 5000);
  }, []);

  const letterButtonStyle = (index: number): React.CSSProperties => {
    const isUsed = formedWord.length > availableLetters.indexOf(availableLetters[index]);
    return {
      padding: '0.75rem 1rem',
      margin: '0.5rem',
      fontSize: '1.2rem',
      fontWeight: '700',
      borderRadius: '0.75rem',
      border: '2px solid rgba(255, 210, 63, 0.4)',
      background: 'rgba(255, 210, 63, 0.1)',
      color: '#FFD23F',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      opacity: isUsed ? 0.4 : 1,
    };
  };

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
        .formed-word-display {
          font-size: 2.5rem;
          font-weight: 700;
          letter-spacing: 0.2em;
          color: #FFD23F;
          min-height: 3rem;
          margin: 1rem 0;
          word-break: break-all;
          font-family: monospace;
        }
        .word-button {
          padding: 0.75rem 1rem;
          margin: 0.5rem;
          font-size: 1.2rem;
          font-weight: 700;
          border-radius: 0.75rem;
          border: 2px solid rgba(255, 210, 63, 0.4);
          background: rgba(255, 210, 63, 0.1);
          color: #FFD23F;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .word-button:hover:not(:disabled) {
          background: rgba(255, 210, 63, 0.2);
          border-color: rgba(255, 210, 63, 0.8);
          transform: scale(1.05);
        }
        .word-button:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
        .found-words-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          justify-content: center;
          margin: 1rem 0;
        }
        .found-word-badge {
          padding: 0.5rem 1rem;
          background: linear-gradient(135deg, rgba(105, 240, 174, 0.2), rgba(46, 196, 182, 0.2));
          border: 2px solid #69F0AE;
          border-radius: 100px;
          color: #69F0AE;
          font-weight: 600;
          font-size: 0.95rem;
        }
        .feedback-message {
          font-size: 1.2rem;
          font-weight: 600;
          margin: 1rem 0;
          min-height: 1.5rem;
        }
        .feedback-correct {
          color: #69F0AE;
        }
        .feedback-invalid {
          color: #FF5252;
        }
      `}</style>

      {gameState === 'playing' && (
        <div style={{ width: '100%', maxWidth: '700px', textAlign: 'center' }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '2rem',
            fontSize: '1.1rem',
            fontWeight: '600',
            color: '#FFD23F',
          }}>
            <div>Round: {roundIndex + 1}/{WORD_SETS.length}</div>
            <div>Score: {score}</div>
          </div>

          {/* Formed Word Display */}
          <div className="formed-word-display">
            {formedWord.length > 0 ? formedWord.join('') : '_____'}
          </div>

          {/* Feedback */}
          <div className={`feedback-message feedback-${feedback.type}`}>
            {feedback.message}
          </div>

          {/* Found Words */}
          {foundWords.size > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ color: '#8EA4C8', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600' }}>
                Words Found: {foundWords.size}/3
              </div>
              <div className="found-words-list">
                {Array.from(foundWords).map(word => (
                  <div key={word} className="found-word-badge">
                    {word}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Fact Display */}
          {showFact && (
            <div style={{
              background: 'rgba(46, 196, 182, 0.15)',
              border: '2px solid #2EC4B6',
              borderRadius: '1rem',
              padding: '1rem',
              marginBottom: '2rem',
              color: '#2EC4B6',
              fontSize: '0.95rem',
              lineHeight: '1.6',
            }}>
              💡 {currentSet.facts}
            </div>
          )}

          {/* Letter Buttons */}
          <div style={{
            background: 'rgba(0, 0, 0, 0.2)',
            borderRadius: '1rem',
            padding: '1.5rem',
            marginBottom: '1.5rem',
            border: '1px solid rgba(255, 210, 63, 0.2)',
          }}>
            <div style={{ marginBottom: '0.5rem', color: '#8EA4C8', fontSize: '0.9rem', fontWeight: '600' }}>
              Select Letters
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
              {availableLetters.map((letter, idx) => (
                <button
                  key={idx}
                  className="word-button"
                  onClick={() => handleLetterClick(idx)}
                  style={{
                    opacity: availableLetters.slice(formedWord.length).includes(letter) ? 1 : 0.3,
                    cursor: availableLetters.slice(formedWord.length).includes(letter) ? 'pointer' : 'not-allowed',
                  }}
                >
                  {letter}
                </button>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}>
            <button
              onClick={handleBackspace}
              disabled={formedWord.length === 0}
              style={{
                padding: '0.75rem 1.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                borderRadius: '0.75rem',
                border: '2px solid rgba(255, 82, 82, 0.4)',
                background: 'rgba(255, 82, 82, 0.1)',
                color: '#FF5252',
                cursor: formedWord.length === 0 ? 'not-allowed' : 'pointer',
                opacity: formedWord.length === 0 ? 0.5 : 1,
                transition: 'all 0.2s ease',
              }}
            >
              ← Backspace
            </button>

            <button
              onClick={handleSubmit}
              disabled={formedWord.length < 3}
              style={{
                padding: '0.75rem 1.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                borderRadius: '0.75rem',
                border: 'none',
                background: 'linear-gradient(135deg, #69F0AE, #2EC4B6)',
                color: '#0A1628',
                cursor: formedWord.length < 3 ? 'not-allowed' : 'pointer',
                opacity: formedWord.length < 3 ? 0.5 : 1,
                transition: 'all 0.2s ease',
              }}
            >
              ✓ Submit
            </button>

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
        </div>
      )}

      {gameState === 'complete' && (
        <div style={{ textAlign: 'center', maxWidth: '600px', width: '100%' }}>
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            marginBottom: '1rem',
            background: 'linear-gradient(135deg, #FFD23F, #FF6B35)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            🎉 All Rounds Complete!
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
            You're a Word Master! You found all the Caribbean words and learned about tropical fruits!
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