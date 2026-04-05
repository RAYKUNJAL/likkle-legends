'use client';

import { useState, useCallback, useEffect } from 'react';
import confetti from 'canvas-confetti';

const RECIPES = [
  {
    name: 'Jerk Chicken',
    ingredients: ['Chicken', 'Scotch Bonnet', 'Thyme', 'Ginger', 'Garlic', 'Cinnamon'],
    correctOrder: [0, 1, 2, 3, 4, 5],
    fact: 'Jerk seasoning comes from Jamaican Maroon traditions and was used to preserve meat!',
    emoji: '🍗',
  },
  {
    name: 'Ackee & Saltfish',
    ingredients: ['Saltfish', 'Ackee', 'Onion', 'Tomato', 'Pepper', 'Oil'],
    correctOrder: [0, 1, 2, 3, 4, 5],
    fact: 'Ackee is the national fruit of Jamaica and has been eaten for centuries!',
    emoji: '🍳',
  },
  {
    name: 'Caribbean Doubles',
    ingredients: ['Dough', 'Chickpea Curry', 'Tamarind', 'Pepper Sauce', 'Cilantro', 'Mango'],
    correctOrder: [0, 1, 2, 3, 4, 5],
    fact: 'Doubles is a famous street food from Trinidad made with two fried bread rounds!',
    emoji: '🫓',
  },
  {
    name: 'Rice & Peas',
    ingredients: ['Rice', 'Red Beans', 'Coconut Milk', 'Thyme', 'Scallion', 'Butter'],
    correctOrder: [0, 1, 2, 3, 4, 5],
    fact: 'Rice and peas are staple foods throughout the Caribbean and Africa!',
    emoji: '🍚',
  },
  {
    name: 'Callaloo Soup',
    ingredients: ['Callaloo', 'Okra', 'Coconut Milk', 'Garlic', 'Crab', 'Seasoning'],
    correctOrder: [0, 1, 2, 3, 4, 5],
    fact: 'Callaloo is a leafy green vegetable used in many Caribbean dishes!',
    emoji: '🥣',
  },
];

interface Ingredient {
  id: number;
  name: string;
}

interface GameProps {
  onComplete?: (score: number) => void;
}

export default function RecipeScramble({ onComplete }: GameProps) {
  const [gameState, setGameState] = useState<'playing' | 'complete'>('playing');
  const [recipeIndex, setRecipeIndex] = useState(0);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<{ message: string; type: 'correct' | 'incorrect' | '' }>({ message: '', type: '' });
  const [showFact, setShowFact] = useState(false);

  const currentRecipe = RECIPES[recipeIndex];

  useEffect(() => {
    // Shuffle ingredients
    const shuffled = currentRecipe.ingredients
      .map((name, idx) => ({ id: idx, name }))
      .sort(() => Math.random() - 0.5);
    setIngredients(shuffled);
    setSelectedOrder([]);
    setFeedback({ message: '', type: '' });
    setShowFact(false);
  }, [recipeIndex, currentRecipe]);

  const handleIngredientSelect = useCallback((id: number) => {
    if (selectedOrder.includes(id)) {
      // Remove if already selected
      setSelectedOrder(selectedOrder.filter(item => item !== id));
    } else {
      // Add if not selected
      setSelectedOrder([...selectedOrder, id]);
    }
  }, [selectedOrder]);

  const handleSubmit = useCallback(() => {
    if (selectedOrder.length !== currentRecipe.ingredients.length) {
      setFeedback({ message: 'Select all ingredients in order!', type: 'incorrect' });
      return;
    }

    // Check if order is correct
    const isCorrect = selectedOrder.every(
      (id, idx) => ingredients.find(ing => ing.id === id)?.name === currentRecipe.ingredients[idx]
    );

    if (isCorrect) {
      setFeedback({ message: `✓ Perfect! ${currentRecipe.name} prepared!`, type: 'correct' });
      setScore(prev => prev + 100);

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      setShowFact(true);

      if (recipeIndex < RECIPES.length - 1) {
        setTimeout(() => {
          setRecipeIndex(recipeIndex + 1);
        }, 3000);
      } else {
        setTimeout(() => {
          setGameState('complete');
          if (onComplete) {
            onComplete(score + 100);
          }
        }, 3000);
      }
    } else {
      setFeedback({ message: 'Not quite right. Try rearranging the ingredients!', type: 'incorrect' });
      setTimeout(() => {
        setSelectedOrder([]);
      }, 1500);
    }
  }, [selectedOrder, ingredients, currentRecipe, recipeIndex, score, onComplete]);

  const handleReset = useCallback(() => {
    setSelectedOrder([]);
    setFeedback({ message: '', type: '' });
  }, []);

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
        .ingredient-card {
          padding: 1rem;
          background: rgba(255, 140, 0, 0.1);
          border: 2px solid rgba(255, 140, 0, 0.3);
          border-radius: 0.75rem;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: center;
          color: #FFD23F;
          font-weight: 600;
          min-height: 80px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
        .ingredient-card:hover {
          background: rgba(255, 140, 0, 0.2);
          border-color: rgba(255, 140, 0, 0.8);
          transform: translateY(-2px);
        }
        .ingredient-card.selected {
          background: rgba(255, 140, 0, 0.3);
          border-color: #FFD23F;
          box-shadow: 0 0 12px rgba(255, 140, 0, 0.4);
        }
        .order-item {
          padding: 0.75rem 1rem;
          background: linear-gradient(135deg, rgba(105, 240, 174, 0.2), rgba(46, 196, 182, 0.2));
          border: 2px solid #69F0AE;
          border-radius: 0.75rem;
          color: #69F0AE;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.95rem;
        }
        .order-number {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          background: #69F0AE;
          color: #0A1628;
          border-radius: 50%;
          font-weight: 700;
          font-size: 0.85rem;
        }
      `}</style>

      {gameState === 'playing' && (
        <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{
            textAlign: 'center',
            marginBottom: '2rem',
          }}>
            <div style={{
              fontSize: '3rem',
              marginBottom: '0.5rem',
            }}>
              {currentRecipe.emoji}
            </div>
            <h2 style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: '#FFD23F',
              marginBottom: '0.5rem',
            }}>
              {currentRecipe.name}
            </h2>
            <div style={{
              color: '#8EA4C8',
              fontSize: '0.95rem',
              marginBottom: '1.5rem',
            }}>
              Recipe {recipeIndex + 1}/{RECIPES.length}
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '1rem',
              fontWeight: '600',
              color: '#FFD23F',
              marginBottom: '1.5rem',
            }}>
              <div>Score: {score}</div>
              <div>Selected: {selectedOrder.length}/{currentRecipe.ingredients.length}</div>
            </div>
          </div>

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
              textAlign: 'center',
            }}>
              📚 {currentRecipe.fact}
            </div>
          )}

          {/* Feedback */}
          <div style={{
            textAlign: 'center',
            fontSize: '1.1rem',
            fontWeight: '600',
            marginBottom: '1.5rem',
            minHeight: '1.5rem',
            color: feedback.type === 'correct' ? '#69F0AE' : feedback.type === 'incorrect' ? '#FF5252' : 'transparent',
          }}>
            {feedback.message}
          </div>

          {/* Selected Order */}
          {selectedOrder.length > 0 && (
            <div style={{
              marginBottom: '2rem',
              padding: '1rem',
              background: 'rgba(0, 0, 0, 0.2)',
              borderRadius: '1rem',
              border: '1px solid rgba(105, 240, 174, 0.3)',
            }}>
              <div style={{
                color: '#8EA4C8',
                fontSize: '0.9rem',
                fontWeight: '600',
                marginBottom: '0.75rem',
              }}>
                Recipe Order:
              </div>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.75rem',
              }}>
                {selectedOrder.map((id, idx) => {
                  const ingredient = ingredients.find(ing => ing.id === id);
                  return (
                    <div key={id} className="order-item">
                      <div className="order-number">{idx + 1}</div>
                      <span>{ingredient?.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Ingredients Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem',
            padding: '1.5rem',
            background: 'rgba(0, 0, 0, 0.2)',
            borderRadius: '1rem',
            border: '1px solid rgba(255, 140, 0, 0.2)',
          }}>
            {ingredients.map(ingredient => (
              <div
                key={ingredient.id}
                className={`ingredient-card ${selectedOrder.includes(ingredient.id) ? 'selected' : ''}`}
                onClick={() => handleIngredientSelect(ingredient.id)}
                style={{
                  opacity: selectedOrder.includes(ingredient.id) ? 1 : 1,
                  cursor: selectedOrder.includes(ingredient.id) ? 'pointer' : 'pointer',
                }}
              >
                <div>{ingredient.name}</div>
                {selectedOrder.includes(ingredient.id) && (
                  <div style={{
                    fontSize: '0.8rem',
                    marginTop: '0.25rem',
                    color: '#FFD23F',
                  }}>
                    ✓ Step {selectedOrder.indexOf(ingredient.id) + 1}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Controls */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}>
            <button
              onClick={handleReset}
              disabled={selectedOrder.length === 0}
              style={{
                padding: '0.75rem 1.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                borderRadius: '0.75rem',
                border: '2px solid rgba(255, 82, 82, 0.4)',
                background: 'rgba(255, 82, 82, 0.1)',
                color: '#FF5252',
                cursor: selectedOrder.length === 0 ? 'not-allowed' : 'pointer',
                opacity: selectedOrder.length === 0 ? 0.5 : 1,
                transition: 'all 0.2s ease',
              }}
            >
              🔄 Reset
            </button>

            <button
              onClick={handleSubmit}
              disabled={selectedOrder.length !== currentRecipe.ingredients.length}
              style={{
                padding: '0.75rem 1.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                borderRadius: '0.75rem',
                border: 'none',
                background: 'linear-gradient(135deg, #FFD23F, #FF6B35)',
                color: '#0A1628',
                cursor: selectedOrder.length === currentRecipe.ingredients.length ? 'pointer' : 'not-allowed',
                opacity: selectedOrder.length === currentRecipe.ingredients.length ? 1 : 0.5,
                transition: 'all 0.2s ease',
              }}
            >
              ✓ Cook Recipe
            </button>
          </div>
        </div>
      )}

      {gameState === 'complete' && (
        <div style={{ textAlign: 'center', maxWidth: '600px', margin: 'auto', width: '100%' }}>
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            marginBottom: '1rem',
            background: 'linear-gradient(135deg, #FFD23F, #FF6B35)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            🍳 Chef Complete!
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
            You've mastered all the Caribbean recipes! You're an expert chef! 👨‍🍳
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