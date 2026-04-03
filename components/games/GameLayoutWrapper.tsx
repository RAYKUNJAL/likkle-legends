'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface GameLayoutWrapperProps {
  gameId: string;
  title: string;
  description: string;
  learningFocus: string;
  characterBadge: { emoji: string; name: string; color: string };
  xpReward: number;
  gradient: string;
  children: React.ReactNode;
}

export default function GameLayoutWrapper({
  gameId,
  title,
  description,
  learningFocus,
  characterBadge,
  xpReward,
  gradient,
  children,
}: GameLayoutWrapperProps) {
  const [stars, setStars] = useState<Array<{ id: number; left: string; top: string; size: string; delay: string; duration: string }>>([]);

  useEffect(() => {
    const generatedStars = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      left: Math.random() * 100 + '%',
      top: Math.random() * 100 + '%',
      size: (Math.random() * 2 + 1) + 'px',
      delay: Math.random() * 3 + 's',
      duration: (Math.random() * 3 + 2) + 's',
    }));
    setStars(generatedStars);
  }, []);

  const floaters = ['🌴', '🐠', '🌊', '🦜'];

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(180deg, #0A1628 0%, #0D2137 40%, #0F2B4A 70%, #134A6E 100%)`,
      color: '#F0F4FF',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <style jsx global>{`
        .game-star {
          position: fixed;
          width: 3px;
          height: 3px;
          background: #fff;
          border-radius: 50%;
          animation: twinkle 3s ease-in-out infinite alternate;
          pointer-events: none;
        }
        @keyframes twinkle {
          0% { opacity: 0.15; }
          100% { opacity: 0.9; }
        }
        .game-floater {
          position: fixed;
          font-size: 2rem;
          opacity: 0.07;
          pointer-events: none;
          z-index: 1;
          animation: floatAnim 20s ease-in-out infinite;
        }
        @keyframes floatAnim {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-30px) rotate(5deg); }
          50% { transform: translateY(-10px) rotate(-3deg); }
          75% { transform: translateY(-25px) rotate(4deg); }
        }
      `}</style>

      {/* Stars */}
      {stars.map(star => (
        <div
          key={star.id}
          className="game-star"
          style={{
            left: star.left,
            top: star.top,
            width: star.size,
            height: star.size,
            animationDelay: star.delay,
            animationDuration: star.duration,
          }}
        />
      ))}

      {/* Floating decorations */}
      {floaters.map((emoji, i) => (
        <div
          key={i}
          className="game-floater"
          style={{
            top: `${15 + i * 20}%`,
            left: i % 2 === 0 ? '5%' : '92%',
            animationDelay: `${i * 3}s`,
          }}
        >
          {emoji}
        </div>
      ))}

      {/* Header */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        background: `linear-gradient(135deg, rgba(255, 210, 63, 0.15), rgba(255, 107, 53, 0.15))`,
        borderBottom: `2px solid rgba(255, 210, 63, 0.2)`,
        padding: '2rem 1.5rem',
        marginBottom: '2rem',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Link
            href="/portal/games"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#FFD23F',
              textDecoration: 'none',
              fontSize: '1rem',
              fontWeight: '600',
              marginBottom: '1rem',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#FF6B35')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#FFD23F')}
          >
            ← Back to Games
          </Link>

          <div style={{ marginBottom: '1.5rem' }}>
            <h1 style={{
              fontSize: 'clamp(1.8rem, 5vw, 2.5rem)',
              fontWeight: '700',
              margin: '0 0 0.5rem 0',
              background: `linear-gradient(135deg, #FFD23F, #FF6B35)`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              {title}
            </h1>
            <p style={{
              fontSize: '1rem',
              color: '#8EA4C8',
              margin: '0.5rem 0 1rem 0',
              lineHeight: '1.6',
            }}>
              {description}
            </p>
          </div>

          {/* Character Badge & XP */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '2rem',
            alignItems: 'center',
          }}>
            {/* Character Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.75rem',
              background: `rgba(${parseInt(characterBadge.color.slice(1, 3), 16)}, ${parseInt(characterBadge.color.slice(3, 5), 16)}, ${parseInt(characterBadge.color.slice(5, 7), 16)}, 0.15)`,
              padding: '0.75rem 1.5rem',
              borderRadius: '100px',
              border: `2px solid ${characterBadge.color}`,
            }}>
              <span style={{ fontSize: '1.5rem' }}>{characterBadge.emoji}</span>
              <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>With {characterBadge.name}</span>
            </div>

            {/* XP Reward Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: `linear-gradient(135deg, rgba(255, 210, 63, 0.2), rgba(255, 107, 53, 0.2))`,
              padding: '0.75rem 1.5rem',
              borderRadius: '100px',
              border: '2px solid rgba(255, 210, 63, 0.4)',
              fontWeight: '600',
              fontSize: '0.9rem',
            }}>
              <span style={{ fontSize: '1.2rem' }}>⭐</span>
              <span>Earn up to {xpReward} XP</span>
            </div>
          </div>

          {/* Learning Focus */}
          <div style={{
            marginTop: '1.5rem',
            padding: '1rem',
            background: 'rgba(0, 0, 0, 0.2)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 210, 63, 0.15)',
            fontSize: '0.9rem',
            color: '#8EA4C8',
          }}>
            <span style={{ fontWeight: '600', color: '#FFD23F' }}>Learning Focus:</span> {learningFocus}
          </div>
        </div>
      </div>

      {/* Game Content */}
      <div style={{
        position: 'relative',
        zIndex: 5,
        padding: '1rem',
        maxWidth: '1200px',
        margin: '0 auto',
      }}>
        {children}
      </div>
    </div>
  );
}