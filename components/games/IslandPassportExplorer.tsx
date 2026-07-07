'use client';

import { useState, useCallback, useEffect } from 'react';
import confetti from 'canvas-confetti';

const ISLANDS = [
  {
    name: 'Jamaica',
    flag: '🇯🇲',
    capital: 'Kingston',
    currency: 'Jamaican Dollar',
    population: '2.8 Million',
    facts: 'Jamaica is the birthplace of reggae music and Bob Marley!',
    food: 'Jerk Chicken & Rice and Peas',
  },
  {
    name: 'Trinidad & Tobago',
    flag: '🇹🇹',
    capital: 'Port of Spain',
    currency: 'Trinidad and Tobago Dollar',
    population: '1.4 Million',
    facts: 'Home of the steel drum and Carnival celebration!',
    food: 'Doubles & Roti',
  },
  {
    name: 'Barbados',
    flag: '🇧🇧',
    capital: 'Bridgetown',
    currency: 'Barbadian Dollar',
    population: '0.3 Million',
    facts: 'Barbados is known for its beautiful beaches and rum!',
    food: 'Cou-cou & Fish Cakes',
  },
  {
    name: 'The Bahamas',
    flag: '🇧🇸',
    capital: 'Nassau',
    currency: 'Bahamian Dollar',
    population: '0.4 Million',
    facts: 'The Bahamas has over 700 islands and is a diving paradise!',
    food: 'Conch Salad & Cracked Conch',
  },
  {
    name: 'Grenada',
    flag: '🇬🇩',
    capital: 'St. George\'s',
    currency: 'East Caribbean Dollar',
    population: '0.1 Million',
    facts: 'Grenada is the spice island, famous for nutmeg production!',
    food: 'Callaloo & Oil Down',
  },
  {
    name: 'Saint Lucia',
    flag: '🇱🇨',
    capital: 'Castries',
    currency: 'East Caribbean Dollar',
    population: '0.2 Million',
    facts: 'Saint Lucia is home to the famous Pitons, UNESCO World Heritage site!',
    food: 'Green Fig & Saltfish',
  },
  {
    name: 'Dominica',
    flag: '🇩🇲',
    capital: 'Roseau',
    currency: 'East Caribbean Dollar',
    population: '0.07 Million',
    facts: 'Dominica is the nature island with rainforests and waterfalls!',
    food: 'Manicou & Ground Provisions',
  },
  {
    name: 'Guyana',
    flag: '🇬🇾',
    capital: 'Georgetown',
    currency: 'Guyanese Dollar',
    population: '0.8 Million',
    facts: 'Guyana has the second largest rainforest and stunning Kaieteur Falls!',
    food: 'Pepperpot & Roti',
  },
];

interface GameProps {
  onComplete?: (score: number) => void;
}

export default function IslandPassportExplorer({ onComplete }: GameProps) {
  const [gameState, setGameState] = useState<'explore' | 'trivia' | 'complete'>('explore');
  const [islandIndex, setIslandIndex] = useState(0);
  const [stampsCollected, setStampsCollected] = useState<Set<number>>(new Set());
  const [score, setScore] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [feedback, setFeedback] = useState<{ message: string; type: 'correct' | 'incorrect' | '' }>({ message: '', type: '' });
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  const island = ISLANDS[islandIndex];

  const QUIZ_QUESTIONS: Array<{
    question: string;
    options: string[];
    correctIndex: number;
  }> = [
    {
      question: `What is the capital of ${island.name}?`,
      options: [island.capital, 'Port Royal', 'Montego Bay', 'St. Johns'],
      correctIndex: 0,
    },
    {
      question: `What currency is used in ${island.name}?`,
      options: [island.currency, 'US Dollar', 'British Pound', 'Euro'],
      correctIndex: 0,
    },
    {
      question: `Which food is popular in ${island.name}?`,
      options: [island.food, 'Pad Thai', 'Paella', 'Sushi'],
      correctIndex: 0,
    },
  ];

  const handleStartTrivia = useCallback(() => {
    if (stampsCollected.has(islandIndex)) {
      // Already collected, move to next island
      if (islandIndex < ISLANDS.length - 1) {
        setIslandIndex(islandIndex + 1);
      } else {
        setGameState('complete');
        if (onComplete) {
          onComplete(score);
        }
      }
    } else {
      setGameState('trivia');
      setCurrentQuestion(0);
      setFeedback({ message: '', type: '' });
      setSelectedAnswer(null);
    }
  }, [islandIndex, stampsCollected, score, onComplete]);

  const handleAnswer = useCallback((selectedIndex: number) => {
    setSelectedAnswer(selectedIndex);

    const correctIndex = QUIZ_QUESTIONS[currentQuestion].correctIndex;

    if (selectedIndex === correctIndex) {
      setFeedback({ message: '✓ Correct!', type: 'correct' });

      if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
        setTimeout(() => {
          setCurrentQuestion(currentQuestion + 1);
          setSelectedAnswer(null);
          setFeedback({ message: '', type: '' });
        }, 1500);
      } else {
        // All questions correct - award stamp
        setFeedback({ message: '🎉 All correct! Stamp earned!', type: 'correct' });
        const newStamps = new Set([...stampsCollected, islandIndex]);
        setStampsCollected(newStamps);
        setScore(prev => prev + 20);

        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.5 },
        });

        setTimeout(() => {
          setGameState('explore');
          if (islandIndex < ISLANDS.length - 1) {
            setIslandIndex(islandIndex + 1);
          } else {
            setGameState('complete');
            if (onComplete) {
              onComplete(score + 20);
            }
          }
        }, 2500);
      }
    } else {
      setFeedback({ message: 'Not quite right. Try again!', type: 'incorrect' });
      setTimeout(() => {
        setSelectedAnswer(null);
        setFeedback({ message: '', type: '' });
      }, 1500);
    }
  }, [currentQuestion, QUIZ_QUESTIONS, islandIndex, stampsCollected, score, onComplete]);

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
        .island-card {
          background: linear-gradient(135deg, rgba(102, 187, 255, 0.1), rgba(63, 169, 245, 0.1));
          border: 2px solid #3FA9F5;
          border-radius: 1.5rem;
          padding: 2rem;
          text-align: center;
          margin-bottom: 2rem;
          max-width: 500px;
          width: 100%;
        }
        .island-flag {
          font-size: 5rem;
          margin-bottom: 1rem;
        }
        .island-name {
          font-size: 2rem;
          fontWeight: 700;
          color: #3FA9F5;
          margin-bottom: 0.5rem;
        }
        .stamp {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #FFD23F, #FF6B35);
          border-radius: 10px;
          transform: rotate(15deg);
          font-size: 2rem;
          margin: 0 0.5rem;
        }
        .answer-button {
          display: block;
          width: 100%;
          padding: 1rem;
          margin: 0.75rem 0;
          font-size: 1rem;
          fontWeight: 600;
          border: 2px solid rgba(63, 169, 245, 0.4);
          background: rgba(63, 169, 245, 0.1);
          color: #3FA9F5;
          border-radius: 0.75rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .answer-button:hover {
          background: rgba(63, 169, 245, 0.2);
          border-color: rgba(63, 169, 245, 0.8);
          transform: translateX(5px);
        }
        .answer-button.selected {
          background: rgba(63, 169, 245, 0.3);
          border-color: #3FA9F5;
        }
        .answer-button.correct {
          background: rgba(105, 240, 174, 0.3);
          border-color: #69F0AE;
          color: #69F0AE;
        }
        .answer-button.incorrect {
          background: rgba(255, 82, 82, 0.3);
          border-color: #FF5252;
          color: #FF5252;
        }
      `}</style>

      {gameState === 'explore' && (
        <div style={{ width: '100%', maxWidth: '700px' }}>
          {/* Passport Progress */}
          <div style={{
            textAlign: 'center',
            marginBottom: '2rem',
          }}>
            <h2 style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: '#3FA9F5',
              marginBottom: '1rem',
            }}>
              📖 Passport Explorer
            </h2>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '0.75rem',
              flexWrap: 'wrap',
              marginBottom: '1rem',
            }}>
              {ISLANDS.map((_, idx) => (
                <div
                  key={idx}
                  className="stamp"
                  style={{
                    opacity: stampsCollected.has(idx) ? 1 : 0.3,
                  }}
                >
                  {stampsCollected.has(idx) ? '✓' : idx + 1}
                </div>
              ))}
            </div>
            <div style={{
              color: '#FFD23F',
              fontSize: '1rem',
              fontWeight: '600',
            }}>
              {stampsCollected.size}/8 Islands Explored • Score: {score}
            </div>
          </div>

          {/* Island Card */}
          <div className="island-card">
            <div className="island-flag">{island.flag}</div>
            <div className="island-name">{island.name}</div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
              marginBottom: '1.5rem',
              textAlign: 'left',
            }}>
              <div style={{
                background: 'rgba(63, 169, 245, 0.2)',
                padding: '0.75rem',
                borderRadius: '0.5rem',
                color: '#3FA9F5',
                fontSize: '0.85rem',
              }}>
                <div style={{ fontWeight: '600' }}>Capital</div>
                <div>{island.capital}</div>
              </div>
              <div style={{
                background: 'rgba(63, 169, 245, 0.2)',
                padding: '0.75rem',
                borderRadius: '0.5rem',
                color: '#3FA9F5',
                fontSize: '0.85rem',
              }}>
                <div style={{ fontWeight: '600' }}>Population</div>
                <div>{island.population}</div>
              </div>
              <div style={{
                background: 'rgba(63, 169, 245, 0.2)',
                padding: '0.75rem',
                borderRadius: '0.5rem',
                color: '#3FA9F5',
                fontSize: '0.85rem',
              }}>
                <div style={{ fontWeight: '600' }}>Currency</div>
                <div>{island.currency}</div>
              </div>
              <div style={{
                background: 'rgba(63, 169, 245, 0.2)',
                padding: '0.75rem',
                borderRadius: '0.5rem',
                color: '#3FA9F5',
                fontSize: '0.85rem',
              }}>
                <div style={{ fontWeight: '600' }}>Food</div>
                <div>{island.food}</div>
              </div>
            </div>

            <div style={{
              background: 'rgba(46, 196, 182, 0.15)',
              border: '1px solid #2EC4B6',
              borderRadius: '0.75rem',
              padding: '1rem',
              color: '#2EC4B6',
              marginBottom: '1.5rem',
              fontSize: '0.9rem',
              fontStyle: 'italic',
            }}>
              💡 {island.facts}
            </div>

            <button
              onClick={handleStartTrivia}
              style={{
                width: '100%',
                padding: '1rem',
                fontSize: '1rem',
                fontWeight: '700',
                borderRadius: '0.75rem',
                border: 'none',
                background: stampsCollected.has(islandIndex)
                  ? 'rgba(105, 240, 174, 0.3)'
                  : 'linear-gradient(135deg, #3FA9F5, #2EC4B6)',
                color: stampsCollected.has(islandIndex) ? '#69F0AE' : '#0A1628',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
            >
              {stampsCollected.has(islandIndex) ? '✓ Explored - Next Island' : '🎯 Answer Questions for Stamp'}
            </button>
          </div>
        </div>
      )}

      {gameState === 'trivia' && (
        <div style={{ width: '100%', maxWidth: '600px' }}>
          <div style={{
            textAlign: 'center',
            marginBottom: '2rem',
          }}>
            <div style={{
              fontSize: '3rem',
              marginBottom: '1rem',
            }}>
              {island.flag}
            </div>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: '#3FA9F5',
              marginBottom: '1.5rem',
            }}>
              {QUIZ_QUESTIONS[currentQuestion].question}
            </h3>

            <div style={{
              color: '#8EA4C8',
              fontSize: '0.9rem',
              marginBottom: '1.5rem',
            }}>
              Question {currentQuestion + 1}/3
            </div>

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

            <div>
              {QUIZ_QUESTIONS[currentQuestion].options.map((option, idx) => (
                <button
                  key={idx}
                  className={`answer-button ${
                    selectedAnswer === idx
                      ? feedback.type === 'correct'
                        ? 'correct'
                        : feedback.type === 'incorrect'
                        ? 'incorrect'
                        : 'selected'
                      : ''
                  }`}
                  onClick={() => handleAnswer(idx)}
                  disabled={selectedAnswer !== null}
                  style={{
                    opacity: selectedAnswer === null || selectedAnswer === idx ? 1 : 0.4,
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
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
            🎉 Legendary Passport!
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
            Congratulations! You've collected all 8 island stamps and learned about the Caribbean! You're a true explorer! 🌍
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