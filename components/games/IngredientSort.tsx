'use client';

import { useState, useCallback, useEffect } from 'react';
import confetti from 'canvas-confetti';

const CATEGORIES = [
  { name: 'Vegetables', emoji: '🥬', color: '#69F0AE', id: 'vegetables' },
  { name: 'Fruits', emoji: '🍌', color: '#FFD23F', id: 'fruits' },
  { name: 'Spices', emoji: '🌶️', color: '#FF5252', id: 'spices' },
  { name: 'Grains', emoji: '🌾', color: '#FF8FCC', id: 'grains' },
];

const INGREDIENTS = [
  { name: 'Okra', emoji: '🥒', category: 'vegetables' },
  { name: 'Callaloo', emoji: '🥬', category: 'vegetables' },
  { name: 'Eddoes', emoji: '🥔', category: 'vegetables' },
  { name: 'Cassava', emoji: '🥔', category: 'vegetables' },
  { name: 'Yam', emoji: '🥔', category: 'vegetables' },
  { name: 'Mango', emoji: '🥭', category: 'fruits' },
  { name: 'Plantain', emoji: '🍌', category: 'fruits' },
  { name: 'Coconut', emoji: '🥥', category: 'fruits' },
  { name: 'Guava', emoji: '🍓', category: 'fruits' },
  { name: 'Breadfruit', emoji: '🍈', category: 'fruits' },
  { name: 'Scotch Bonnet', emoji: '🌶️', category: 'spices' },
  { name: 'Turmeric', emoji: '🟡', category: 'spices' },
  { name: 'Ginger', emoji: '🟤', category: 'spices' },
  { name: 'Curry', emoji: '🟤', category: 'spices' },
  { name: 'Nutmeg', emoji: '🟤', category: 'spices' },
  { name: 'Rice', emoji: '🌾', category: 'grains' },
  { name: 'Corn', emoji: '🌽', category: 'grains' },
  { name: 'Roti', emoji: '🫓', category: 'grains' },
  { name: 'Flour', emoji: '🟤', category: 'grains' },
  { name: 'Millet', emoji: '🟡', category: 'grains' },
];

interface Ingredient {
  name: string;
  emoji: string;
  category: string;
  id: number;
  placed?: boolean;
}

interface GameProps {
  onComplete?: (score: number) => void;
}

export default function IngredientSort({ onComplete }: GameProps) {
  const [gameState, setGameState] = useState<'playing' | 'complete'>('playing');
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [placed, setPlaced] = useState<Set<number>>(new Set());
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<{ id?: number; type: 'correct' | 'incorrect' | '' }>({ type: '' });
  const [draggedItem, setDraggedItem] = useState<number | null>(null);

  const TOTAL_ITEMS = 20;

  useEffect(() => {
    // Shuffle and select 20 items
    const shuffled = INGREDIENTS.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, TOTAL_ITEMS);
    const withIds = selected.map((ing, idx) => ({ ...ing, id: idx }));
    setIngredients(withIds);
  }, []);

  const handleDragStart = useCallback((id: number) => {
    setDraggedItem(id);
  }, []);

  const handleDropOnCategory = useCallback((categoryId: string) => {
    if (draggedItem === null) return;

    const ingredient = ingredients.find(ing => ing.id === draggedItem);
    if (!ingredient) return;

    if (ingredient.category === categoryId) {
      // Correct placement
      setFeedback({ id: draggedItem, type: 'correct' });
      setPlaced(new Set([...placed, draggedItem]));
      setScore(prev => prev + 50);

      confetti({
        particleCount: 30,
        spread: 45,
        origin: { y: 0.5 },
      });

      setTimeout(() => {
        setFeedback({ type: '' });
      }, 800);

      if (placed.size + 1 === TOTAL_ITEMS) {
        setTimeout(() => {
          setGameState('complete');
          if (onComplete) {
            onComplete(score + 50);
          }
        }, 1000);
      }
    } else {
      // Incorrect placement
      setFeedback({ id: draggedItem, type: 'incorrect' });
      setTimeout(() => {
        setFeedback({ type: '' });
      }, 600);
    }

    setDraggedItem(null);
  }, [draggedItem, ingredients, placed, score, onComplete]);

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      minHeight: '100vh',
      background: 'linear-gradient(180deg, rgba(20, 30, 50, 0.8) 0%, rgba(30, 50, 80, 0.6) 100%)',
      display: 'flex',
      flexDirection: 'column',
      padding: '2rem 1rem',
      borderRadius: '1.5rem',
    }}>
      <style jsx>{`
        .ingredient-item {
          padding: 0.75rem 1rem;
          background: rgba(255, 210, 63, 0.1);
          border: 2px solid rgba(255, 210, 63, 0.3);
          border-radius: 0.75rem;
          cursor: grab;
          user-select: none;
          transition: all 0.2s ease;
          color: #FFD23F;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1rem;
        }
        .ingredient-item:hover {
          background: rgba(255, 210, 63, 0.2);
          border-color: rgba(255, 210, 63, 0.6);
          transform: translateY(-2px);
        }
        .ingredient-item:active {
          cursor: grabbing;
        }
        .ingredient-item.placed {
          opacity: 0.3;
          cursor: default;
        }
        .ingredient-item.placed:hover {
          background: rgba(255, 210, 63, 0.1);
          border-color: rgba(255, 210, 63, 0.3);
          transform: none;
        }
        .category-basket {
          flex: 1;
          min-height: 150px;
          border: 3px dashed;
          border-radius: 1rem;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          transition: all 0.3s ease;
          cursor: drop;
          position: relative;
        }
        .category-basket.drag-over {
          transform: scale(1.05);
          background: rgba(255, 255, 255, 0.1);
        }
        .basket-emoji {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
        }
        .basket-label {
          font-size: 1.1rem;
          font-weight: 600;
          text-align: center;
        }
        .basket-count {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: rgba(255, 255, 255, 0.2);
          padding: 0.5rem 1rem;
          border-radius: 100px;
          font-size: 0.9rem;
          font-weight: 600;
        }
        @keyframes correctBounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(0.8); }
        }
        @keyframes incorrectShake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .correct-anim {
          animation: correctBounce 0.6s ease-in-out;
        }
        .incorrect-anim {
          animation: incorrectShake 0.4s ease-in-out;
        }
      `}</style>

      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        fontSize: '1.1rem',
        fontWeight: '600',
        color: '#FFD23F',
      }}>
        <div>Progress: {placed.size}/{TOTAL_ITEMS}</div>
        <div>Score: {score}</div>
      </div>

      {gameState === 'playing' && (
        <>
          {/* Category Baskets - Drop Zone */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem',
            marginBottom: '3rem',
          }}>
            {CATEGORIES.map(category => (
              <div
                key={category.id}
                className={`category-basket ${draggedItem ? 'drag-over' : ''}`}
                style={{
                  borderColor: category.color,
                  background: `rgba(${parseInt(category.color.slice(1, 3), 16)}, ${parseInt(category.color.slice(3, 5), 16)}, ${parseInt(category.color.slice(5, 7), 16)}, 0.05)`,
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDropOnCategory(category.id)}
              >
                <div className="basket-emoji">{category.emoji}</div>
                <div className="basket-label" style={{ color: category.color }}>
                  {category.name}
                </div>
                <div className="basket-count" style={{ color: category.color }}>
                  {ingredients.filter(ing => ing.category === category.id && placed.has(ing.id)).length}/{ingredients.filter(ing => ing.category === category.id).length}
                </div>
              </div>
            ))}
          </div>

          {/* Ingredients to Sort */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: '1rem',
            padding: '1.5rem',
            background: 'rgba(0, 0, 0, 0.2)',
            borderRadius: '1rem',
            border: '1px solid rgba(255, 210, 63, 0.2)',
          }}>
            {ingredients.map(ingredient => (
              <div
                key={ingredient.id}
                className={`ingredient-item ${placed.has(ingredient.id) ? 'placed' : ''} ${
                  feedback.id === ingredient.id
                    ? feedback.type === 'correct'
                      ? 'correct-anim'
                      : 'incorrect-anim'
                    : ''
                }`}
                draggable={!placed.has(ingredient.id)}
                onDragStart={() => handleDragStart(ingredient.id)}
                style={{
                  opacity: placed.has(ingredient.id) ? 0.3 : 1,
                }}
              >
                <span>{ingredient.emoji}</span>
                <span>{ingredient.name}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {gameState === 'complete' && (
        <div style={{
          textAlign: 'center',
          maxWidth: '600px',
          margin: 'auto',
          width: '100%',
        }}>
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            marginBottom: '1rem',
            background: 'linear-gradient(135deg, #FFD23F, #FF6B35)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            🎉 Sorted Perfectly!
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
            Excellent work! You sorted all the Caribbean ingredients correctly. You're a kitchen master! 👨‍🍳
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
