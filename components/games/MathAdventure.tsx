'use client';

import { useState, useCallback, useEffect } from 'react';
import confetti from 'canvas-confetti';

const LEVEL_DATA = [
  {
    name: 'Addition Quest',
    operation: 'addition',
    emoji: '➕',
    story: 'Help R.O.T.I. deliver mangoes to the market!',
    problems: [
      { question: 'You have 12 mangoes and pick 8 more. How many total?', answer: 20 },
      { question: 'At the first island, you deliver 5 mangoes. You had 20. How many left?', answer: 15 },
      { question: 'The second island gets 7 mangoes. Add 3 more for the next stop. How many mangoes total?', answer: 10 },
    ],
  },
  {
    name: 'Subtraction Saga',
    operation: 'subtraction',
    emoji: '➖',
    story: 'R.O.T.I. is sharing coconuts with island friends!',
    problems: [
      { question: 'You have 30 coconuts. Give 12 to friends. How many remain?', answer: 18 },
      { question: 'Starting with 18 coconuts, you use 6 for juice. How many are left?', answer: 12 },
      { question: 'You have 12 coconuts left. Trade 5 with a neighbor. How many do you keep?', answer: 7 },
    ],
  },
  {
    name: 'Multiplication Mission',
    operation: 'multiplication',
    emoji: '✖️',
    story: 'Each island needs equal portions of rice and peas!',
    problems: [
      { question: 'You visit 3 islands. Each needs 4 baskets of rice. How many baskets total?', answer: 12 },
      { question: 'Make 5 portions of peas, each with 6 cups. How many cups total?', answer: 30 },
      { question: 'Pack 4 bags with 7 plantains each. How many plantains?', answer: 28 },
    ],
  },
  {
    name: 'Division Journey',
    operation: 'division',
    emoji: '➗',
    story: 'Share fruits equally among friends!',
    problems: [
      { question: 'You have 24 mangoes to share with 6 friends equally. Each friend gets?', answer: 4 },
      { question: 'Divide 15 papayas among 3 baskets equally. Each basket has?', answer: 5 },
      { question: 'Split 20 bananas into 4 equal groups. Each group has?', answer: 5 },
    ],
  },
  {
    name: 'Master Challenge',
    operation: 'mixed',
    emoji: '🎯',
    story: 'Solve mixed problems to become a Math Master!',
    problems: [
      { question: 'You have 10 fruits, add 5 more, then give away 3. How many now?', answer: 12 },
      { question: 'Buy 4 bags with 3 items each, use 6. How many items left?', answer: 6 },
      { question: 'Start with 24, divide by 3, add 8. What\'s the total?', answer: 16 },
    ],
  },
];

interface GameProps {
  onComplete?: (score: number) => void;
}

export default function MathAdventure({ onComplete }: GameProps) {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'complete'>('start');
  const [currentLevel, setCurrentLevel] = useState(0);
  const [currentProblem, setCurrentProblem] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<{ message: string; type: 'correct' | 'incorrect' | '' }>({ message: '', type: '' });
  const [levelProgress, setLevelProgress] = useState<Map<number, boolean>>(new Map());

  const level = LEVEL_DATA[currentLevel];
  const problem = level.problems[currentProblem];

  const handleStart = useCallback(() => {
    setGameState('playing');
    setCurrentLevel(0);
    setCurrentProblem(0);
    setUserAnswer('');
    setScore(0);
    setFeedback({ message: '', type: '' });
    setLevelProgress(new Map());
  }, []);

  const handleSubmit = useCallback(() => {
    const answer = parseInt(userAnswer);

    if (isNaN(answer)) {
      setFeedback({ message: 'Please enter a number!', type: 'incorrect' });
      return;
    }

    if (answer === problem.answer) {
      setFeedback({ message: '✓ Correct!', type: 'correct' });
      setScore(prev => prev + 20);

      confetti({
        particleCount: 40,
        spread: 45,
        origin: { y: 0.6 },
      });

      setTimeout(() => {
        if (currentProblem < level.problems.length - 1) {
          setCurrentProblem(currentProblem + 1);
          setUserAnswer('');
          setFeedback({ message: '', type: '' });
        } else {
          // Level complete
          const newProgress = new Map(levelProgress);
          newProgress.set(currentLevel, true);
          setLevelProgress(newProgress);

          setFeedback({ message: `🎉 ${level.name} Complete! +20 XP`, type: 'correct' });
          setScore(prev => prev + 20);

          if (currentLevel < LEVEL_DATA.length - 1) {
            setTimeout(() => {
              setCurrentLevel(currentLevel + 1);
              setCurrentProblem(0);
              setUserAnswer('');
              setFeedback({ message: '', type: '' });
            }, 2500);
          } else {
            setTimeout(() => {
              setGameState('complete');
              if (onComplete) {
                onComplete(score + 40);
              }
            }, 2500);
          }
        }
      }, 1500);
    } else {
      setFeedback({ message: `Not quite. The answer is ${problem.answer}.`, type: 'incorrect' });
      setTimeout(() => {
        setUserAnswer('');
        setFeedback({ message: '', type: '' });
      }, 2000);
    }
  }, [userAnswer, problem, currentProblem, level, currentLevel, levelProgress, score, onComplete]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  }, [handleSubmit]);

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
        .input-field {
          width: 100%;
          max-width: 300px;
          padding: 1rem;
          font-size: 1.5rem;
          font-weight: 700;
          text-align: center;
          border: 3px solid rgba(46, 196, 182, 0.5);
          background: rgba(46, 196, 182, 0.1);
          border-radius: 0.75rem;
          color: #2EC4B6;
          margin: 1rem 0;
        }
        .input-field:focus {
          outline: none;
          border-color: #2EC4B6;
          background: rgba(46, 196, 182, 0.2);
        }
        .input-field::placeholder {
          color: rgba(46, 196, 182, 0.5);
        }
        .level-indicator {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: rgba(46, 196, 182, 0.15);
          border: 1px solid #2EC4B6;
          border-radius: 100px;
          color: #2EC4B6;
          font-weight: 600;
          font-size: 0.9rem;
          margin: 0.5rem;
        }
      `}</style>

      {gameState === 'start' && (
        <div style={{ textAlign: 'center', maxWidth: '600px' }}>
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            marginBottom: '1rem',
            background: 'linear-gradient(135deg, #2EC4B6, #12B886)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            🤖 R.O.T.I.'s Math Adventure
          </h2>

          <p style={{
            fontSize: '1.1rem',
            color: '#8EA4C8',
            marginBottom: '2rem',
            lineHeight: '1.6',
          }}>
            Join R.O.T.I. on a mathematical journey across the Caribbean! Solve math problems to help deliver fruits and goods to islands!
          </p>

          <div style={{
            background: 'rgba(46, 196, 182, 0.1)',
            border: '2px solid #2EC4B6',
            borderRadius: '1rem',
            padding: '1.5rem',
            marginBottom: '2rem',
            textAlign: 'left',
          }}>
            <div style={{
              fontSize: '1rem',
              fontWeight: '600',
              color: '#2EC4B6',
              marginBottom: '1rem',
            }}>
              📋 {LEVEL_DATA.length} Levels:
            </div>
            {LEVEL_DATA.map((lvl, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  color: '#8EA4C8',
                  fontSize: '0.9rem',
                  marginBottom: idx < LEVEL_DATA.length - 1 ? '0.5rem' : 0,
                }}
              >
                <span style={{ fontSize: '1.2rem' }}>{lvl.emoji}</span>
                <span>{lvl.name}</span>
                <span style={{ marginLeft: 'auto' }}>3 problems</span>
              </div>
            ))}
          </div>

          <button
            onClick={handleStart}
            style={{
              padding: '1rem 2rem',
              fontSize: '1.2rem',
              fontWeight: '700',
              borderRadius: '1rem',
              border: 'none',
              background: 'linear-gradient(135deg, #2EC4B6, #12B886)',
              color: '#0A1628',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(46, 196, 182, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Begin Adventure
          </button>
        </div>
      )}

      {gameState === 'playing' && (
        <div style={{ width: '100%', maxWidth: '700px' }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem',
            flexWrap: 'wrap',
            gap: '1rem',
          }}>
            <div style={{ color: '#FFD23F', fontSize: '1rem', fontWeight: '600' }}>
              Score: {score}
            </div>
            <div className="level-indicator">
              {level.emoji} {level.name}
            </div>
            <div style={{ color: '#8EA4C8', fontSize: '0.9rem', fontWeight: '600' }}>
              Problem {currentProblem + 1}/3
            </div>
          </div>

          {/* Story */}
          <div style={{
            textAlign: 'center',
            fontSize: '1rem',
            color: '#2EC4B6',
            marginBottom: '2rem',
            fontStyle: 'italic',
          }}>
            {level.story}
          </div>

          {/* Question */}
          <div style={{
            background: 'rgba(46, 196, 182, 0.1)',
            border: '2px solid #2EC4B6',
            borderRadius: '1rem',
            padding: '2rem',
            marginBottom: '2rem',
            textAlign: 'center',
          }}>
            <div style={{
              fontSize: '1.3rem',
              fontWeight: '700',
              color: '#2EC4B6',
              lineHeight: '1.8',
              marginBottom: '1rem',
            }}>
              {problem.question}
            </div>

            {feedback.message && (
              <div style={{
                fontSize: '1.1rem',
                fontWeight: '600',
                color: feedback.type === 'correct' ? '#69F0AE' : '#FF5252',
                marginTop: '1rem',
              }}>
                {feedback.message}
              </div>
            )}
          </div>

          {/* Input */}
          {feedback.type !== 'correct' && (
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{
                color: '#8EA4C8',
                fontSize: '0.9rem',
                marginBottom: '0.75rem',
                fontWeight: '600',
              }}>
                What's your answer?
              </div>
              <input
                type="number"
                className="input-field"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter number"
                autoFocus
              />
              <button
                onClick={handleSubmit}
                style={{
                  padding: '0.75rem 2rem',
                  fontSize: '1rem',
                  fontWeight: '600',
                  borderRadius: '0.75rem',
                  border: 'none',
                  background: 'linear-gradient(135deg, #2EC4B6, #12B886)',
                  color: '#0A1628',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
              >
                ✓ Submit
              </button>
            </div>
          )}

          {/* Level Progress */}
          <div style={{
            textAlign: 'center',
            display: 'flex',
            justifyContent: 'center',
            gap: '0.75rem',
            marginTop: '2rem',
          }}>
            {Array.from({ length: LEVEL_DATA.length }).map((_, idx) => (
              <div
                key={idx}
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '700',
                  fontSize: '1rem',
                  border: idx === currentLevel ? '3px solid #2EC4B6' : '1px solid rgba(46, 196, 182, 0.3)',
                  background: levelProgress.has(idx)
                    ? 'rgba(105, 240, 174, 0.3)'
                    : idx < currentLevel
                    ? 'rgba(46, 196, 182, 0.2)'
                    : 'rgba(46, 196, 182, 0.05)',
                  color: levelProgress.has(idx) ? '#69F0AE' : '#2EC4B6',
                }}
              >
                {levelProgress.has(idx) ? '✓' : idx + 1}
              </div>
            ))}
          </div>
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
            🎉 Math Master!
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
            Congratulations! You've completed R.O.T.I.'s Math Adventure and successfully delivered goods across the Caribbean! You're a math champion! 🏆
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