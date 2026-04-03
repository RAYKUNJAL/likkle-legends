'use client';

import Link from 'next/link';

export default function SpellingBlazeGame() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0A1628 0%, #0D2137 40%, #0F2B4A 70%, #134A6E 100%)',
      color: '#F0F4FF',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'General Sans', sans-serif",
      padding: '2rem',
    }}>
      <div style={{ textAlign: 'center', maxWidth: '600px' }}>
        <h1 style={{
          fontSize: '3rem',
          marginBottom: '1rem',
          background: 'linear-gradient(135deg, #FFD23F, #FF6B35)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          🔥 Scorcha's Spelling Blaze
        </h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '2rem', opacity: 0.8 }}>
          Spell Caribbean words before the fire timer burns out!
        </p>
        <div style={{
          background: 'rgba(19, 34, 64, 0.8)',
          padding: '2rem',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          marginBottom: '2rem',
        }}>
          <p style={{ fontSize: '1rem', marginBottom: '1rem' }}>
            🚀 Game coming soon! Race Scorcha Pepper to earn blazing spelling badges!
          </p>
          <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>
            In the meantime, explore other games in the Game Zone!
          </p>
        </div>
        <Link href="/games" style={{
          display: 'inline-block',
          padding: '0.8rem 2rem',
          background: 'linear-gradient(135deg, #FF1744, #D50000)',
          color: 'white',
          borderRadius: '12px',
          textDecoration: 'none',
          fontWeight: 600,
          transition: 'transform 0.2s',
          cursor: 'pointer',
        }}
        onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
        onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          ← Back to Games
        </Link>
      </div>
    </div>
  );
}