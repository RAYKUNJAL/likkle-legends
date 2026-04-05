'use client';

import { useState, useCallback, useEffect } from 'react';
import confetti from 'canvas-confetti';

const MARKET_ITEMS = [
  { name: 'Coconut', emoji: '🥥', price: 5 },
  { name: 'Mango', emoji: '🥭', price: 3 },
  { name: 'Plantain', emoji: '🍌', price: 4 },
  { name: 'Yam', emoji: '🥔', price: 6 },
  { name: 'Okra', emoji: '🥒', price: 2 },
  { name: 'Callaloo', emoji: '🥬', price: 3 },
  { name: 'Pepper', emoji: '🌶️', price: 2 },
  { name: 'Fish', emoji: '🐟', price: 8 },
  { name: 'Rice', emoji: '🍚', price: 4 },
  { name: 'Corn', emoji: '🌽', price: 3 },
];

interface CartItem {
  name: string;
  emoji: string;
  price: number;
  quantity: number;
}

interface GameProps {
  onComplete?: (score: number) => void;
}

export default function CountingMarket({ onComplete }: GameProps) {
  const [gameState, setGameState] = useState<'start' | 'shopping' | 'checkout'>('start');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [budget, setBudget] = useState(50);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<{ message: string; type: 'correct' | 'incorrect' | '' }>({ message: '', type: '' });
  const [changeGiven, setChangeGiven] = useState<number | null>(null);
  const [targetAmount, setTargetAmount] = useState(0);

  const DIFFICULTY_BUDGETS: Record<string, number> = {
    easy: 50,
    medium: 75,
    hard: 100,
  };

  const startGame = useCallback(() => {
    const selectedBudget = DIFFICULTY_BUDGETS[difficulty];
    setBudget(selectedBudget);
    setTargetAmount(selectedBudget);
    setCart([]);
    setScore(0);
    setFeedback({ message: '', type: '' });
    setChangeGiven(null);
    setGameState('shopping');
  }, [difficulty]);

  const getTotalCost = useCallback(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);

  const handleAddItem = useCallback((item: typeof MARKET_ITEMS[0]) => {
    setFeedback({ message: '', type: '' });

    const newCart = [...cart];
    const existingItem = newCart.find(ci => ci.name === item.name);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      newCart.push({
        name: item.name,
        emoji: item.emoji,
        price: item.price,
        quantity: 1,
      });
    }

    const newTotal = newCart.reduce((sum, ci) => sum + ci.price * ci.quantity, 0);

    if (newTotal <= budget) {
      setCart(newCart);
    } else {
      setFeedback({ message: 'Budget exceeded! Remove items.', type: 'incorrect' });
    }
  }, [cart, budget]);

  const handleRemoveItem = useCallback((name: string) => {
    const newCart = cart.map(item =>
      item.name === name && item.quantity > 1
        ? { ...item, quantity: item.quantity - 1 }
        : item.name === name
        ? null
        : item
    ).filter(Boolean) as CartItem[];

    setCart(newCart);
    setFeedback({ message: '', type: '' });
  }, [cart]);

  const handleCheckout = useCallback(() => {
    setGameState('checkout');
  }, []);

  const handlePayment = useCallback((amountGiven: number) => {
    const totalCost = getTotalCost();
    const change = amountGiven - totalCost;

    setChangeGiven(amountGiven);

    if (change >= 0) {
      setFeedback({
        message: `✓ Correct! Total: $${totalCost}, Given: $${amountGiven}, Change: $${change}`,
        type: 'correct',
      });
      setScore(prev => prev + 100);

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      setTimeout(() => {
        if (onComplete) {
          onComplete(score + 100);
        }
      }, 2000);
    } else {
      setFeedback({
        message: `Not enough money! Total: $${totalCost}, but you gave: $${amountGiven}`,
        type: 'incorrect',
      });
    }
  }, [getTotalCost, score, onComplete]);

  const totalCost = getTotalCost();

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
        .market-item {
          padding: 1rem;
          background: rgba(0, 255, 150, 0.1);
          border: 2px solid rgba(0, 255, 150, 0.3);
          border-radius: 0.75rem;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: center;
          color: #20C997;
          font-weight: 600;
        }
        .market-item:hover {
          background: rgba(0, 255, 150, 0.2);
          border-color: rgba(0, 255, 150, 0.8);
          transform: translateY(-2px);
        }
        .market-item-emoji {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }
        .cart-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem;
          background: rgba(46, 196, 182, 0.1);
          border: 1px solid rgba(46, 196, 182, 0.3);
          border-radius: 0.5rem;
          margin-bottom: 0.5rem;
          color: #2EC4B6;
          font-weight: 600;
          font-size: 0.95rem;
        }
        .payment-button {
          padding: 0.75rem 1.5rem;
          margin: 0.5rem;
          font-size: 1rem;
          font-weight: 600;
          border-radius: 0.75rem;
          border: 2px solid rgba(46, 196, 182, 0.4);
          background: rgba(46, 196, 182, 0.1);
          color: #2EC4B6;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .payment-button:hover {
          background: rgba(46, 196, 182, 0.2);
          border-color: rgba(46, 196, 182, 0.8);
          transform: scale(1.05);
        }
      `}</style>

      {gameState === 'start' && (
        <div style={{ textAlign: 'center', maxWidth: '600px', margin: 'auto', width: '100%' }}>
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            marginBottom: '1rem',
            background: 'linear-gradient(135deg, #20C997, #12B886)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            🏪 Market Shopping
          </h2>

          <p style={{
            fontSize: '1.1rem',
            color: '#8EA4C8',
            marginBottom: '2rem',
            lineHeight: '1.6',
          }}>
            Welcome to the Caribbean Market! Choose your difficulty, then shop and make the correct change!
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
                  borderColor: difficulty === level ? '#20C997' : 'rgba(32, 201, 151, 0.3)',
                  background: difficulty === level ? 'rgba(32, 201, 151, 0.2)' : 'transparent',
                  color: '#20C997',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textTransform: 'capitalize',
                }}
              >
                {level === 'easy' && '🎯 Easy ($50)'}
                {level === 'medium' && '🎯🎯 Medium ($75)'}
                {level === 'hard' && '🎯🎯🎯 Hard ($100)'}
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
              background: 'linear-gradient(135deg, #20C997, #12B886)',
              color: '#0A1628',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(32, 201, 151, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Start Shopping
          </button>
        </div>
      )}

      {gameState === 'shopping' && (
        <div style={{ width: '100%', maxWidth: '900px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{
            textAlign: 'center',
            marginBottom: '2rem',
          }}>
            <h2 style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: '#20C997',
              marginBottom: '0.5rem',
            }}>
              🏪 Caribbean Market
            </h2>
            <div style={{
              display: 'flex',
              justifyContent: 'space-around',
              fontSize: '1rem',
              fontWeight: '600',
              color: '#FFD23F',
              marginBottom: '1rem',
              flexWrap: 'wrap',
            }}>
              <div>Budget: ${budget}</div>
              <div>Spent: ${totalCost}</div>
              <div style={{
                color: budget - totalCost < 0 ? '#FF5252' : '#69F0AE',
              }}>
                Remaining: ${budget - totalCost}
              </div>
            </div>
          </div>

          {feedback.message && (
            <div style={{
              textAlign: 'center',
              fontSize: '1rem',
              fontWeight: '600',
              marginBottom: '1.5rem',
              color: feedback.type === 'correct' ? '#69F0AE' : '#FF5252',
            }}>
              {feedback.message}
            </div>
          )}

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '2rem',
            marginBottom: '2rem',
          }}>
            {/* Market Items */}
            <div>
              <div style={{
                color: '#8EA4C8',
                fontSize: '0.9rem',
                fontWeight: '600',
                marginBottom: '1rem',
                textAlign: 'center',
              }}>
                Available Items
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '0.75rem',
                maxHeight: '400px',
                overflowY: 'auto',
              }}>
                {MARKET_ITEMS.map((item, idx) => (
                  <div
                    key={idx}
                    className="market-item"
                    onClick={() => handleAddItem(item)}
                    style={{
                      opacity: budget - totalCost >= item.price ? 1 : 0.5,
                    }}
                  >
                    <div className="market-item-emoji">{item.emoji}</div>
                    <div>{item.name}</div>
                    <div style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>${item.price}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cart */}
            <div>
              <div style={{
                color: '#8EA4C8',
                fontSize: '0.9rem',
                fontWeight: '600',
                marginBottom: '1rem',
                textAlign: 'center',
              }}>
                Shopping Cart
              </div>
              <div style={{
                background: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '0.75rem',
                padding: '1rem',
                border: '1px solid rgba(46, 196, 182, 0.3)',
                maxHeight: '400px',
                overflowY: 'auto',
              }}>
                {cart.length === 0 ? (
                  <div style={{ color: '#8EA4C8', textAlign: 'center', padding: '2rem 0' }}>
                    (Empty)
                  </div>
                ) : (
                  <>
                    {cart.map((item, idx) => (
                      <div key={idx} className="cart-item">
                        <div>
                          <span>{item.emoji} {item.name}</span>
                          <div style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
                            ${item.price} × {item.quantity} = ${item.price * item.quantity}
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item.name)}
                          style={{
                            background: 'rgba(255, 82, 82, 0.2)',
                            border: 'none',
                            color: '#FF5252',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '0.25rem',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '0.85rem',
                          }}
                        >
                          −
                        </button>
                      </div>
                    ))}
                    <div style={{
                      marginTop: '1rem',
                      paddingTop: '1rem',
                      borderTop: '1px solid rgba(46, 196, 182, 0.3)',
                      fontWeight: '700',
                      fontSize: '1.1rem',
                      color: '#2EC4B6',
                      textAlign: 'right',
                    }}>
                      Total: ${totalCost}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Checkout */}
          <div style={{ textAlign: 'center' }}>
            <button
              onClick={handleCheckout}
              disabled={cart.length === 0}
              style={{
                padding: '0.75rem 2rem',
                fontSize: '1rem',
                fontWeight: '600',
                borderRadius: '0.75rem',
                border: 'none',
                background: 'linear-gradient(135deg, #2EC4B6, #20C997)',
                color: '#0A1628',
                cursor: cart.length === 0 ? 'not-allowed' : 'pointer',
                opacity: cart.length === 0 ? 0.5 : 1,
                transition: 'all 0.3s ease',
              }}
            >
              💳 Go to Checkout
            </button>
          </div>
        </div>
      )}

      {gameState === 'checkout' && (
        <div style={{ textAlign: 'center', maxWidth: '600px', margin: 'auto', width: '100%' }}>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: '700',
            color: '#2EC4B6',
            marginBottom: '2rem',
          }}>
            💳 Make Payment
          </h2>

          <div style={{
            background: 'rgba(46, 196, 182, 0.1)',
            border: '2px solid #2EC4B6',
            borderRadius: '1rem',
            padding: '1.5rem',
            marginBottom: '2rem',
          }}>
            <div style={{
              fontSize: '1.1rem',
              color: '#8EA4C8',
              marginBottom: '1rem',
            }}>
              Total Bill:
            </div>
            <div style={{
              fontSize: '3rem',
              fontWeight: '700',
              color: '#2EC4B6',
            }}>
              ${totalCost}
            </div>
          </div>

          {feedback.message && (
            <div style={{
              fontSize: '1rem',
              fontWeight: '600',
              marginBottom: '1.5rem',
              color: feedback.type === 'correct' ? '#69F0AE' : '#FF5252',
            }}>
              {feedback.message}
            </div>
          )}

          {!changeGiven && (
            <div>
              <div style={{
                color: '#8EA4C8',
                fontSize: '0.9rem',
                fontWeight: '600',
                marginBottom: '1rem',
              }}>
                Select how much to pay:
              </div>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: '0.75rem',
                marginBottom: '1rem',
              }}>
                {[totalCost, totalCost + 5, totalCost + 10, totalCost - 5, totalCost - 10].map((amount, idx) => (
                  amount > 0 && (
                    <button
                      key={idx}
                      className="payment-button"
                      onClick={() => handlePayment(amount)}
                    >
                      ${amount}
                    </button>
                  )
                ))}
              </div>
            </div>
          )}

          {changeGiven && feedback.type === 'correct' && (
            <div style={{
              fontSize: '1.2rem',
              color: '#69F0AE',
              marginTop: '2rem',
            }}>
              ✓ Perfect change calculated!
            </div>
          )}
        </div>
      )}
    </div>
  );
}
