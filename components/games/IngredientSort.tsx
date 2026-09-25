'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import confetti from 'canvas-confetti';
import { INGREDIENT_ROUND_SIZES } from '@/lib/games/long-play';
import { basketIdFromPoint, dragExceeded } from '@/lib/games/ingredient-sort';

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
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [status, setStatus] = useState('');
  const [round, setRound] = useState(1);
  const [goal, setGoal] = useState<number>(INGREDIENT_ROUND_SIZES[0]);
  const [ghostLabel, setGhostLabel] = useState<string | null>(null);

  const placedRef = useRef<Set<number>>(new Set());
  const placingRef = useRef(false);
  const ingredientsRef = useRef<Ingredient[]>([]);
  const scoreRef = useRef(0);
  const goalRef = useRef<number>(INGREDIENT_ROUND_SIZES[0]);
  const roundRef = useRef(1);
  const onCompleteRef = useRef(onComplete);
  const feedbackTimer = useRef<number | null>(null);
  const pointerCleanupRef = useRef<(() => void) | null>(null);
  const ghostRef = useRef<HTMLDivElement>(null);
  const ghostPoint = useRef({ x: 0, y: 0, on: false });
  const basketPressRef = useRef<{ id: string; pointerId: number; x: number; y: number } | null>(null);
  const roundTimerRef = useRef<number | null>(null);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    ingredientsRef.current = ingredients;
  }, [ingredients]);

  const hideGhost = useCallback(() => {
    ghostPoint.current.on = false;
    setGhostLabel(null);
    document.querySelectorAll('[data-basket]').forEach((element) => {
      element.classList.remove('drag-over');
    });
  }, []);

  const dealBoard = useCallback((size: number) => {
    const shuffled = [...INGREDIENTS].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, size).map((ingredient, index) => ({ ...ingredient, id: index }));
    placedRef.current = new Set();
    ingredientsRef.current = selected;
    goalRef.current = size;
    setIngredients(selected);
    setPlaced(new Set());
    setDraggedItem(null);
    setSelectedId(null);
    setStatus('');
    setGoal(size);
    setGhostLabel(null);
    ghostPoint.current.on = false;
  }, []);

  useEffect(() => {
    dealBoard(INGREDIENT_ROUND_SIZES[0]);
    return () => {
      pointerCleanupRef.current?.();
      if (feedbackTimer.current) window.clearTimeout(feedbackTimer.current);
      if (roundTimerRef.current) window.clearTimeout(roundTimerRef.current);
    };
  }, [dealBoard]);

  useLayoutEffect(() => {
    const ghost = ghostRef.current;
    if (!ghost) return;
    if (!ghostPoint.current.on || !ghostLabel) {
      ghost.style.display = 'none';
      return;
    }
    ghost.style.display = 'flex';
    ghost.style.transform = `translate(${ghostPoint.current.x}px, ${ghostPoint.current.y}px) translate(-50%, -50%)`;
  }, [ghostLabel]);

  const showFeedback = useCallback((id: number, type: 'correct' | 'incorrect') => {
    if (feedbackTimer.current) window.clearTimeout(feedbackTimer.current);
    setFeedback({ id, type });
    feedbackTimer.current = window.setTimeout(() => {
      setFeedback({ type: '' });
    }, type === 'correct' ? 800 : 600);
  }, []);

  const placeIngredient = useCallback((id: number, categoryId: string) => {
    if (placingRef.current || placedRef.current.has(id)) return;
    const ingredient = ingredientsRef.current.find((item) => item.id === id);
    if (!ingredient) return;

    if (ingredient.category !== categoryId) {
      setSelectedId(id);
      setStatus(`${ingredient.name} does not go there. Try another basket.`);
      showFeedback(id, 'incorrect');
      return;
    }

    placingRef.current = true;
    const next = new Set(placedRef.current);
    next.add(id);
    placedRef.current = next;
    const nextScore = scoreRef.current + 50;
    scoreRef.current = nextScore;
    setPlaced(next);
    setScore(nextScore);
    setSelectedId(null);
    setDraggedItem(null);
    setStatus('');
    showFeedback(id, 'correct');

    confetti({
      particleCount: 30,
      spread: 45,
      origin: { y: 0.5 },
    });

    const finishedBoard = next.size === goalRef.current;
    if (finishedBoard && roundRef.current < INGREDIENT_ROUND_SIZES.length) {
      const nextRound = roundRef.current + 1;
      roundTimerRef.current = window.setTimeout(() => {
        roundRef.current = nextRound;
        setRound(nextRound);
        dealBoard(INGREDIENT_ROUND_SIZES[nextRound - 1]);
        placingRef.current = false;
      }, 700);
      return;
    }

    if (finishedBoard) {
      roundTimerRef.current = window.setTimeout(() => {
        setGameState('complete');
        onCompleteRef.current?.(nextScore);
        placingRef.current = false;
      }, 1000);
      return;
    }

    queueMicrotask(() => {
      placingRef.current = false;
    });
  }, [dealBoard, showFeedback]);

  const paintHover = (basketId: string | null) => {
    document.querySelectorAll('[data-basket]').forEach((element) => {
      element.classList.toggle('drag-over', element.getAttribute('data-basket') === basketId);
    });
  };

  const moveGhost = (x: number, y: number) => {
    ghostPoint.current = { x, y, on: true };
    const ghost = ghostRef.current;
    if (!ghost) return;
    ghost.style.display = 'flex';
    ghost.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
  };

  const onFoodPointerDown = (event: ReactPointerEvent<HTMLButtonElement>, id: number) => {
    if (placedRef.current.has(id)) return;
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    if (event.pointerType !== 'mouse' && event.cancelable) event.preventDefault();

    pointerCleanupRef.current?.();
    const food = event.currentTarget;
    try {
      food.setPointerCapture(event.pointerId);
    } catch {
      // Pointer capture is missing in a few older WebViews. Window listeners still finish the gesture.
    }
    const ingredient = ingredientsRef.current.find((item) => item.id === id);
    if (!ingredient) return;

    const pointerId = event.pointerId;
    const startX = event.clientX;
    const startY = event.clientY;
    let dragging = false;
    setSelectedId(id);
    setStatus(`${ingredient.name} selected. Tap the basket it belongs in.`);

    const move = (pointerEvent: PointerEvent) => {
      if (pointerEvent.pointerId !== pointerId) return;
      if (!dragging && dragExceeded(startX, startY, pointerEvent.clientX, pointerEvent.clientY)) {
        dragging = true;
        setDraggedItem(id);
        setGhostLabel(`${ingredient.emoji} ${ingredient.name}`);
        moveGhost(pointerEvent.clientX, pointerEvent.clientY);
      }
      if (!dragging) return;
      if (pointerEvent.cancelable) pointerEvent.preventDefault();
      moveGhost(pointerEvent.clientX, pointerEvent.clientY);
      paintHover(basketIdFromPoint(document.elementsFromPoint(pointerEvent.clientX, pointerEvent.clientY)));
    };

    const finish = (pointerEvent: PointerEvent) => {
      if (pointerEvent.pointerId !== pointerId) return;
      cleanup();
      hideGhost();
      setDraggedItem(null);
      if (!dragging) {
        setSelectedId(id);
        return;
      }
      const basketId = basketIdFromPoint(document.elementsFromPoint(pointerEvent.clientX, pointerEvent.clientY));
      if (basketId) {
        placeIngredient(id, basketId);
        return;
      }
      setSelectedId(id);
      setStatus(`${ingredient.name} selected. Tap the basket it belongs in.`);
    };

    const cleanup = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', finish);
      window.removeEventListener('pointercancel', finish);
      try {
        if (food.hasPointerCapture(pointerId)) food.releasePointerCapture(pointerId);
      } catch {
        // The pointer is already gone.
      }
      pointerCleanupRef.current = null;
    };

    pointerCleanupRef.current = cleanup;
    window.addEventListener('pointermove', move, { passive: false });
    window.addEventListener('pointerup', finish);
    window.addEventListener('pointercancel', finish);
  };

  const onBasketPointerDown = (event: ReactPointerEvent<HTMLButtonElement>, categoryId: string) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    basketPressRef.current = {
      id: categoryId,
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
    };
  };

  const onBasketPointerUp = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const press = basketPressRef.current;
    basketPressRef.current = null;
    if (!press || press.pointerId !== event.pointerId) return;
    if (dragExceeded(press.x, press.y, event.clientX, event.clientY)) return;
    if (pointerCleanupRef.current) return;
    if (selectedId === null) {
      setStatus('Tap a food first.');
      return;
    }
    placeIngredient(selectedId, press.id);
  };

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      background: 'linear-gradient(180deg, rgba(20, 30, 50, 0.8) 0%, rgba(30, 50, 80, 0.6) 100%)',
      display: 'flex',
      flexDirection: 'column',
      padding: '1.25rem 0.75rem',
      borderRadius: '1.5rem',
    }}>
      <style jsx>{`
        .ingredient-item {
          padding: 0.75rem 1rem;
          min-height: 52px;
          background: rgba(255, 210, 63, 0.1);
          border: 2px solid rgba(255, 210, 63, 0.3);
          border-radius: 0.75rem;
          cursor: pointer;
          user-select: none;
          -webkit-user-select: none;
          -webkit-touch-callout: none;
          touch-action: none;
          transition: background 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
          color: #FFD23F;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1rem;
          font-family: inherit;
          text-align: left;
          width: 100%;
          appearance: none;
        }
        .ingredient-item:hover {
          background: rgba(255, 210, 63, 0.2);
          border-color: rgba(255, 210, 63, 0.6);
          transform: translateY(-2px);
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
        .ingredient-item.selected {
          background: rgba(255, 210, 63, 0.35);
          border-color: #FFD23F;
          box-shadow: 0 0 0 3px rgba(255, 210, 63, 0.45);
        }
        .category-basket {
          flex: 1;
          min-height: 112px;
          border: 3px dashed;
          border-radius: 1rem;
          padding: 1rem 0.75rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          transition: transform 0.2s ease, background 0.2s ease;
          cursor: pointer;
          position: relative;
          touch-action: manipulation;
          font: inherit;
          color: inherit;
          width: 100%;
          appearance: none;
          -webkit-user-select: none;
          -webkit-touch-callout: none;
        }
        .category-basket.ready {
          background: rgba(255, 255, 255, 0.08);
        }
        .category-basket.drag-over {
          transform: scale(1.05);
          background: rgba(255, 255, 255, 0.16);
        }
        .basket-emoji {
          font-size: 2rem;
          margin-bottom: 0.35rem;
          pointer-events: none;
        }
        .basket-label {
          font-size: 1rem;
          font-weight: 600;
          text-align: center;
          pointer-events: none;
        }
        .basket-count {
          position: absolute;
          top: 0.55rem;
          right: 0.55rem;
          background: rgba(255, 255, 255, 0.2);
          padding: 0.25rem 0.65rem;
          border-radius: 100px;
          font-size: 0.8rem;
          font-weight: 600;
          pointer-events: none;
        }
        .ingredient-ghost {
          position: fixed;
          left: 0;
          top: 0;
          z-index: 80;
          display: none;
          align-items: center;
          gap: 0.4rem;
          padding: 0.7rem 0.9rem;
          border-radius: 0.75rem;
          background: #1b2436;
          border: 2px solid #FFD23F;
          color: #FFD23F;
          font-weight: 700;
          pointer-events: none;
          box-shadow: 0 10px 24px rgba(0, 0, 0, 0.35);
        }
        @keyframes correctBounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(0.8); }
        }
        @keyframes incorrectShake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }
        .correct-anim {
          animation: correctBounce 0.6s ease-in-out;
        }
        .incorrect-anim {
          animation: incorrectShake 0.4s ease-in-out;
        }
        @media (min-width: 720px) {
          .category-basket {
            min-height: 150px;
            padding: 1.5rem;
          }
          .basket-emoji {
            font-size: 2.5rem;
          }
        }
      `}</style>

      <div
        ref={ghostRef}
        className="ingredient-ghost"
        aria-hidden="true"
      >
        {ghostLabel}
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '0.75rem',
        marginBottom: '0.75rem',
        fontSize: '1.05rem',
        fontWeight: '600',
        color: '#FFD23F',
      }}>
        <div>Board {round}/{INGREDIENT_ROUND_SIZES.length} · {placed.size}/{goal}</div>
        <div>Score: {score}</div>
      </div>

      {gameState === 'playing' && (
        <p style={{ color: '#8EA4C8', fontWeight: 600, marginTop: 0, marginBottom: '0.35rem' }}>
          Tap a food, then tap its basket. You can also drag it.
        </p>
      )}
      {gameState === 'playing' && status && (
        <p aria-live="polite" style={{ color: '#FFD23F', fontWeight: 700, marginTop: 0, marginBottom: '1rem' }}>
          {status}
        </p>
      )}

      {gameState === 'playing' && (
        <>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(148px, 1fr))',
            gap: '0.75rem',
            marginBottom: '1.25rem',
          }}>
            {CATEGORIES.map((category) => (
              <button
                type="button"
                key={category.id}
                data-basket={category.id}
                className={`category-basket ${selectedId !== null ? 'ready' : ''}`}
                style={{
                  borderColor: category.color,
                  background: `rgba(${parseInt(category.color.slice(1, 3), 16)}, ${parseInt(category.color.slice(3, 5), 16)}, ${parseInt(category.color.slice(5, 7), 16)}, 0.05)`,
                }}
                aria-label={`${category.name} basket`}
                onPointerDown={(event) => onBasketPointerDown(event, category.id)}
                onPointerUp={onBasketPointerUp}
                onPointerCancel={() => {
                  basketPressRef.current = null;
                }}
                onClick={(event) => {
                  if (event.detail !== 0) return;
                  if (selectedId === null) {
                    setStatus('Tap a food first.');
                    return;
                  }
                  placeIngredient(selectedId, category.id);
                }}
              >
                <div className="basket-emoji">{category.emoji}</div>
                <div className="basket-label" style={{ color: category.color }}>
                  {category.name}
                </div>
                <div className="basket-count" style={{ color: category.color }}>
                  {ingredients.filter((item) => item.category === category.id && placed.has(item.id)).length}/{ingredients.filter((item) => item.category === category.id).length}
                </div>
              </button>
            ))}
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: '0.75rem',
            padding: '0.9rem',
            background: 'rgba(0, 0, 0, 0.2)',
            borderRadius: '1rem',
            border: '1px solid rgba(255, 210, 63, 0.2)',
          }}>
            {ingredients.map((ingredient) => {
              const isPlaced = placed.has(ingredient.id);
              return (
                <button
                  type="button"
                  key={ingredient.id}
                  className={`ingredient-item ${isPlaced ? 'placed' : ''} ${
                    selectedId === ingredient.id && !isPlaced ? 'selected' : ''
                  } ${
                    feedback.id === ingredient.id
                      ? feedback.type === 'correct'
                        ? 'correct-anim'
                        : 'incorrect-anim'
                      : ''
                  } ${draggedItem === ingredient.id ? 'selected' : ''}`}
                  disabled={isPlaced}
                  aria-pressed={selectedId === ingredient.id}
                  onPointerDown={(event) => onFoodPointerDown(event, ingredient.id)}
                  onClick={(event) => {
                    if (event.detail !== 0 || isPlaced) return;
                    setSelectedId(ingredient.id);
                    setStatus(`${ingredient.name} selected. Tap the basket it belongs in.`);
                  }}
                  onContextMenu={(event) => event.preventDefault()}
                  style={{
                    opacity: isPlaced ? 0.3 : 1,
                  }}
                >
                  <span>{ingredient.emoji}</span>
                  <span>{ingredient.name}</span>
                </button>
              );
            })}
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
            Excellent work! You sorted all the Caribbean ingredients correctly. You&apos;re a kitchen master! 👨‍🍳
          </p>

          <button
            type="button"
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
              minHeight: '52px',
              touchAction: 'manipulation',
            }}
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
}
