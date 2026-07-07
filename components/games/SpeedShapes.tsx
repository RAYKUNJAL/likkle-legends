'use client';

import { useState, useCallback, useEffect } from 'react';
import confetti from 'canvas-confetti';

const SHAPES = ['circle', 'square', 'triangle', 'star', 'hexagon', 'diamond', 'pentagon', 'heart'];
const SHAPE_ICONS: Record<string, string> = {
  circle: '●',
  square: '■',
  triangle: '▲',
  star: '★',
  hexagon: '⬡',
  diamond: '◆',
  pentagon: '⬟',
  heart: '♥',
};

interface GameProps {
  onComplete?: (score: number) => void;
}

export default function SpeedShapes({ onComplete }: GameProps) {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'gameover'>('start');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [currentShape, setCurrentShape] = useState<string>('');
  const [options, setOptions] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'incorrect' | ''; message: string }>({ type: '', message: '' });
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showingShape, setShowingShape] = useState(true);

  const MAX_ROUNDS = 10;
  const REVEAL_TIME = 0.75;
  const ANSWER_TIME: Record<string, number> = { easy: 8, medium: 6, hard: 4 };
  const OPTION_COUNT: Record<string, number> = { easy: 3, medium: 6, hard: 9 };

  const generateRound = useCallback(() => {
    const shuffledShapes = [...SHAPES].sort(() => Math.random() - 0.5);
    const correctShape = shuffledShapes[0];
    const optionCount = OPTION_COUNT[difficulty];
    const wrongOptions = shuffledShapes.slice(1, optionCount);
    const allOptions = [correctShape, ...wrongOptions].sort(() => Math.random() - 0.5);
    setCurrentShape(correctShape);
    setOptions(allOptions);
    setShowingShape(true);
    setSelectedOption(null);
    setFeedback({ type: '', message: '' });
    setTimeRemaining(ANSWER_TIME[difficulty]);
  }, [difficulty]);

  useEffect(() => {
    if (gameState !== 'playing' || !showingShape) return;
    const timer = setTimeout(() => setShowingShape(false), REVEAL_TIME * 1000);
    return () => clearTimeout(timer);
  }, [gameState, showingShape]);

  const nextRound = useCallback(() => {
    if (round < MAX_ROUNDS) {
      setRound(round + 1);
      generateRound();
    } else {
      setGameState('gameover');
      if (onComplete) onComplete(score);
    }
  }, [round, generateRound, score, onComplete]);

  useEffect(() => {
    if (gameState !== 'playing' || showingShape || selectedOption !== null) return;
    if (timeRemaining <= 0) {
      setFeedback({ type: 'incorrect', message: "Time's up!" });
      setSelectedOption('timeout');
      setTimeout(() => nextRound(), 1500);
      return;
    }
    const timer = setTimeout(() => setTimeRemaining(timeRemaining - 0.1), 100);
    return () => clearTimeout(timer);
  }, [gameState, timeRemaining, showingShape, selectedOption, nextRound]);

  const handleShapeSelect = useCallback((selected: string) => {
    if (selectedOption !== null || showingShape) return;
    setSelectedOption(selected);
    if (selected === currentShape) {
      setFeedback({ type: 'correct', message: 'Perfect! 🎉' });
      setScore(prev => prev + 100);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      setTimeout(() => nextRound(), 1500);
    } else {
      setFeedback({ type: 'incorrect', message: `Oops! It was ${SHAPE_ICONS[currentShape]}` });
      setTimeout(() => nextRound(), 1500);
    }
  }, [selectedOption, showingShape, currentShape, nextRound]);

  const startGame = useCallback(() => {
    setScore(0);
    setRound(1);
    setGameState('playing');
    generateRound();
  }, [generateRound]);

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '100vh', background: 'linear-gradient(180deg, rgba(20, 30, 50, 0.8) 0%, rgba(30, 50, 80, 0.6) 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '1rem', borderRadius: '1.5rem' }}>
      <style jsx>{`
        .shape-button { width: 80px; height: 80px; font-size: 3rem; display: flex; align-items: center; justify-content: center; border: 3px solid rgba(255, 210, 63, 0.3); background: rgba(255, 210, 63, 0.05); border-radius: 1rem; cursor: pointer; transition: all 0.2s ease; color: #FFD23F; font-weight: bold; }
        .shape-button:hover:not(:disabled) { background: rgba(255, 210, 63, 0.2); border-color: rgba(255, 210, 63, 0.6); transform: scale(1.1); }
        .shape-button:disabled { opacity: 0.5; cursor: not-allowed; }
        @keyframes shapeReveal { 0% { opacity: 0; transform: scale(0.5); } 100% { opacity: 1; transform: scale(1); } }
        .feedback-text { font-size: 1.5rem; font-weight: 700; margin: 1rem 0; min-height: 2rem; }
        .feedback-correct { color: #69F0AE; }
        .feedback-incorrect { color: #FF5252; }
      `}</style>
      {gameState !== 'start' && (<div style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', right: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '1.2rem', fontWeight: 'bold', color: '#FFD23F' }}><div>Round: {round}/{MAX_ROUNDS}</div><div>Score: {score}</div></div>)}
      {gameState === 'start' && (<div style={{ textAlign: 'center', maxWidth: '600px' }}><h2 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '1rem', background: 'linear-gradient(135deg, #69F0AE, #2EC4B6)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>🟢 Speed Shapes</h2><p style={{ fontSize: '1.1rem', color: '#8EA4C8', marginBottom: '2rem', lineHeight: '1.6' }}>Watch the shape flash, then select it from the options below. Be fast and accurate!</p><div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '2rem' }}>{(['easy', 'medium', 'hard'] as const).map(level => (<button key={level} onClick={() => setDifficulty(level)} style={{ padding: '0.75rem 1.5rem', fontSize: '1rem', fontWeight: '600', borderRadius: '0.75rem', border: '2px solid', borderColor: difficulty === level ? '#FFD23F' : 'rgba(255, 210, 63, 0.3)', background: difficulty === level ? 'rgba(255, 210, 63, 0.2)' : 'transparent', color: '#FFD23F', cursor: 'pointer', textTransform: 'capitalize', transition: 'all 0.2s ease' }}>{level === 'easy' && '⭐ Easy (3 shapes)'}{level === 'medium' && '⭐⭐ Medium (6 shapes)'}{level === 'hard' && '⭐⭐⭐ Hard (9 shapes)'}</button>))}</div><button onClick={startGame} style={{ padding: '1rem 2rem', fontSize: '1.2rem', fontWeight: '700', borderRadius: '1rem', border: 'none', background: 'linear-gradient(135deg, #69F0AE, #2EC4B6)', color: '#0A1628', cursor: 'pointer', transition: 'all 0.3s ease' }}>Start Game</button></div>)}
      {gameState === 'playing' && (<div style={{ textAlign: 'center', width: '100%', maxWidth: '600px' }}>{showingShape && (<div style={{ fontSize: '4rem', marginBottom: '2rem', animation: 'shapeReveal 0.4s ease-in-out' }}>{SHAPE_ICONS[currentShape]}</div>)}{!showingShape && (<div style={{ fontSize: '1.1rem', color: '#FFD23F', marginBottom: '2rem', fontWeight: '600' }}>Time: {Math.max(0, timeRemaining).toFixed(1)}s</div>)}<div className={`feedback-text feedback-${feedback.type}`}>{feedback.message}</div><div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '1rem', marginTop: '2rem', maxWidth: '500px', margin: '2rem auto 0' }}>{options.map((shape, idx) => (<button key={idx} className="shape-button" onClick={() => handleShapeSelect(shape)} disabled={selectedOption !== null || showingShape} style={{ opacity: selectedOption === null || selectedOption === shape || selectedOption === 'timeout' ? 1 : 0.4 }}>{SHAPE_ICONS[shape]}</button>))}</div></div>)}
      {gameState === 'gameover' && (<div style={{ textAlign: 'center', maxWidth: '600px' }}><h2 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '1rem', background: 'linear-gradient(135deg, #FFD23F, #FF6B35)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Game Complete! 🎮</h2><div style={{ fontSize: '3rem', fontWeight: '700', color: '#69F0AE', marginBottom: '1rem' }}>{score} XP</div><p style={{ fontSize: '1rem', color: '#8EA4C8', marginBottom: '2rem', lineHeight: '1.6' }}>Great job! You matched shapes with {difficulty} difficulty.</p><button onClick={() => { setGameState('start'); setScore(0); setRound(1); }} style={{ padding: '0.75rem 1.5rem', fontSize: '1rem', fontWeight: '600', borderRadius: '0.75rem', border: 'none', background: 'linear-gradient(135deg, #69F0AE, #2EC4B6)', color: '#0A1628', cursor: 'pointer' }}>Play Again</button></div>)}
    </div>
  );
}
