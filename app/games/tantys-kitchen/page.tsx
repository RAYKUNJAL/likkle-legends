'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function TantysKitchenGame() {
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

  return (
    <>
      <style jsx global>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; -webkit-font-smoothing: antialiased; }
        body {
          min-height: 100dvh;
          font-family: 'General Sans', sans-serif;
          color: #F0F4FF;
          background: #0A1628;
          overflow-x: hidden;
        }
      `}</style>

      <style jsx>{`
        .bg-ocean {
          position: fixed; inset: 0; z-index: 0;
          background: linear-gradient(180deg, #0A1628 0%, #0D2137 40%, #0F2B4A 70%, #134A6E 100%);
        }
        .stars { position: fixed; inset: 0; z-index: 0; pointer-events: none; }
        .star {
          position: absolute;
          width: 3px; height: 3px;
          background: #fff;
          border-radius: 50%;
          animation: twinkle 3s ease-in-out infinite alternate;
        }
        @keyframes twinkle { 0%{opacity:0.15} 100%{opacity:0.9} }

        .container {
          position: relative; z-index: 10;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }
        .header {
          position: absolute; top: 2rem; left: 0; right: 0;
          text-align: center; z-index: 20;
        }
        .header-title {
          font-size: clamp(1.5rem, 4vw, 2rem);
          font-weight: 700;
          background: linear-gradient(135deg, #FFD23F, #FF6B35);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.25rem;
        }
        .home-link {
          display: inline-block;
          margin-top: 0.5rem;
          color: #8EA4C8;
          font-size: 0.85rem;
          text-decoration: none;
          transition: color 0.2s;
        }
        .home-link:hover { color: #FFD23F; }

        .content {
          text-align: center;
          max-width: 600px;
          margin-top: 4rem;
        }
        .game-icon {
          font-size: 4rem;
          margin-bottom: 1.5rem;
          display: inline-block;
          filter: drop-shadow(0 4px 20px rgba(255,210,63,0.2));
        }
        .game-title {
          font-size: 2.2rem;
          margin-bottom: 1rem;
          font-weight: 700;
          color: #F0F4FF;
        }
        .game-subtitle {
          font-size: 1.1rem;
          margin-bottom: 2rem;
          color: #8EA4C8;
          line-height: 1.6;
        }
        .coming-soon-box {
          background: rgba(19, 34, 64, 0.6);
          padding: 2.5rem;
          border-radius: 20px;
          border: 2px solid rgba(255,105,180,0.2);
          backdrop-filter: blur(10px);
          margin-bottom: 2rem;
        }
        .coming-soon-text {
          font-size: 1rem;
          margin-bottom: 1rem;
          color: #F0F4FF;
        }
        .coming-soon-hint {
          font-size: 0.9rem;
          color: #8EA4C8;
        }
        .back-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          padding: 0.7rem 2rem;
          background: linear-gradient(135deg, #FF69B4, #C2185B);
          color: white;
          border: none;
          border-radius: 12px;
          text-decoration: none;
          font-weight: 600;
          font-size: 0.95rem;
          cursor: pointer;
          transition: transform 0.2s, filter 0.2s;
        }
        .back-btn:hover { transform: scale(1.05); filter: brightness(1.1); }
      `}</style>

      <div className="bg-ocean"></div>
      <div className="stars">
        {stars.map(star => (
          <div
            key={star.id}
            className="star"
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
      </div>

      <div className="header">
        <div className="header-title">Likkle Legends</div>
        <Link href="/games" className="home-link">← Back to Game Zone</Link>
      </div>

      <div className="container">
        <div className="content">
          <div className="game-icon">🍲</div>
          <h1 className="game-title">Tanty's Kitchen</h1>
          <p className="game-subtitle">Drag the right ingredients and cook real Caribbean dishes with Tanty Spice!</p>
          <div className="coming-soon-box">
            <p className="coming-soon-text">🚀 Game coming soon!</p>
            <p className="coming-soon-hint">Learn to cook Caribbean classics with Tanty's guidance. Coming very soon!</p>
          </div>
          <Link href="/games" className="back-btn">← Back to Games</Link>
        </div>
      </div>
    </>
  );
}