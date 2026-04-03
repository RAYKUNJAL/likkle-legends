'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function GamesZone() {
  const [stars, setStars] = useState<Array<{ id: number; left: string; top: string; size: string; delay: string; duration: string }>>([]);

  useEffect(() => {
    const generatedStars = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100 + '%',
      top: Math.random() * 55 + '%',
      size: (Math.random() * 2 + 1) + 'px',
      delay: Math.random() * 3 + 's',
      duration: (Math.random() * 3 + 2) + 's',
    }));
    setStars(generatedStars);
  }, []);

  const games = [
    {
      id: 'island-hop',
      character: '🦋 Mango Moko',
      title: "Mango's Island Hop",
      description: 'Hop across the Caribbean islands answering trivia about flags, capitals, and fun facts with Mango Moko as your guide.',
      tags: ['Geography', 'Trivia', 'Ages 4-8'],
      icon: '🏝️',
      themeClass: 'char-mango',
      link: '/games/island-hop',
      image: '/images/mango_moko.png',
    },
    {
      id: 'tantys-kitchen',
      character: '👵🏾 Tanty Spice',
      title: "Tanty's Kitchen",
      description: 'Drag the right ingredients into the pot and cook 5 real Caribbean dishes with Tanty Spice guiding every step.',
      tags: ['Cooking', 'Sorting', 'Ages 3-8'],
      icon: '🍲',
      themeClass: 'char-tanty',
      link: '/games/tantys-kitchen',
      image: '/images/tanty_spice_avatar.jpg',
    },
    {
      id: 'math-market',
      character: '🤖 R.O.T.I.',
      title: "R.O.T.I.'s Math Market",
      description: 'Count fruit, add prices, and make change at a Caribbean market stall. Math gets tastier with R.O.T.I.',
      tags: ['Math', 'Counting', 'Ages 4-8'],
      icon: '🧮',
      themeClass: 'char-roti',
      link: '/games/math-market',
      image: '/images/roti-new.jpg',
    },
    {
      id: 'spelling-blaze',
      character: '🌶️ Scorcha Pepper',
      title: "Scorcha's Spelling Blaze",
      description: 'Spell Caribbean words before the fire timer burns out. Race Scorcha Pepper to earn blazing badges.',
      tags: ['Spelling', 'Speed', 'Ages 5-8'],
      icon: '🔥',
      themeClass: 'char-scorcha',
      link: '/games/spelling-blaze',
      image: '/images/scorcha_pepper.jpg',
    },
  ];

  return (
    <>
      <style jsx global>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --font-display: 'Chillax', sans-serif;
          --font-body: 'General Sans', sans-serif;
          --yellow: #FFD23F;
          --orange: #FF6B35;
          --teal: #01B4A0;
          --blue: #2EC4B6;
          --pink: #FF69B4;
          --purple: #9B5DE5;
          --green: #00C853;
          --red: #FF1744;
          --bg: #0A1628;
          --surface: #132240;
          --text: #F0F4FF;
          --text-muted: #8EA4C8;
        }
        html { scroll-behavior: smooth; -webkit-font-smoothing: antialiased; }
        body {
          min-height: 100dvh;
          font-family: var(--font-body);
          color: var(--text);
          background: var(--bg);
          overflow-x: hidden;
        }
      `}</style>

      <style jsx>{`
        .bg-ocean {
          position: fixed; inset: 0; z-index: 0;
          background: linear-gradient(180deg, #0A1628 0%, #0D2137 40%, #0F2B4A 70%, #134A6E 100%);
        }
        .bg-ocean::before {
          content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 40%;
          background: radial-gradient(ellipse at 50% 100%, rgba(1,180,160,0.12) 0%, transparent 70%);
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
        .floater {
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
        .header {
          position: relative; z-index: 10;
          padding: 2.5rem 1.5rem 1rem;
          text-align: center;
        }
        .logo-row {
          display: flex; align-items: center; justify-content: center; gap: 0.75rem;
          margin-bottom: 0.5rem;
        }
        .logo-text {
          font-family: var(--font-display);
          font-size: clamp(1.8rem, 4vw, 2.8rem);
          font-weight: 700;
          background: linear-gradient(135deg, var(--yellow), var(--orange));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .subtitle {
          font-family: var(--font-display);
          font-size: clamp(0.95rem, 2.2vw, 1.25rem);
          color: var(--text-muted);
          font-weight: 500;
          margin-bottom: 0.25rem;
        }
        .home-link {
          display: inline-block;
          margin-top: 0.5rem;
          color: var(--text-muted);
          font-size: 0.85rem;
          text-decoration: none;
          transition: color 0.2s;
        }
        .home-link:hover { color: var(--yellow); }
        .games-section {
          position: relative; z-index: 10;
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem 1.5rem 4rem;
        }
        .games-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
        }
        .game-card {
          background: var(--surface);
          border-radius: 20px;
          overflow: hidden;
          cursor: pointer;
          transition: transform 0.35s cubic-bezier(0.16,1,0.3,1), box-shadow 0.35s ease;
          border: 2px solid rgba(255,255,255,0.05);
          text-decoration: none;
          color: inherit;
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        .game-card:hover {
          transform: translateY(-8px) scale(1.015);
          box-shadow: 0 24px 60px rgba(0,0,0,0.45);
        }
        .card-banner {
          height: 220px;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .card-banner .banner-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(0deg, var(--surface) 0%, transparent 60%);
        }
        .card-banner .banner-icon {
          position: absolute;
          top: 12px; right: 12px;
          font-size: 2rem;
          filter: drop-shadow(0 2px 8px rgba(0,0,0,0.4));
          z-index: 2;
        }
        .card-body {
          padding: 1.25rem 1.5rem 1.5rem;
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .card-character {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.78rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-bottom: 0.5rem;
          padding: 0.2rem 0.7rem;
          border-radius: 100px;
          width: fit-content;
        }
        .card-title {
          font-family: var(--font-display);
          font-size: clamp(1.15rem, 2vw, 1.4rem);
          font-weight: 700;
          margin-bottom: 0.35rem;
          line-height: 1.2;
        }
        .card-desc {
          font-size: 0.88rem;
          color: var(--text-muted);
          line-height: 1.5;
          margin-bottom: 0.75rem;
          flex: 1;
        }
        .card-tags {
          display: flex; flex-wrap: wrap; gap: 0.35rem;
          margin-bottom: 1rem;
        }
        .tag {
          font-size: 0.7rem;
          font-weight: 600;
          padding: 0.18rem 0.55rem;
          border-radius: 100px;
          background: rgba(255,255,255,0.06);
          color: var(--text-muted);
        }
        .play-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          padding: 0.65rem 1.4rem;
          border-radius: 12px;
          font-family: var(--font-display);
          font-weight: 600;
          font-size: 0.95rem;
          color: #fff;
          border: none;
          cursor: pointer;
          transition: transform 0.2s, filter 0.2s;
          width: 100%;
          text-align: center;
        }
        .play-btn:hover { transform: scale(1.03); filter: brightness(1.1); }
        .char-mango .card-character { background: rgba(0,200,83,0.15); color: #69F0AE; }
        .char-mango .play-btn { background: linear-gradient(135deg, #00C853, #2E7D32); }
        .char-tanty .card-character { background: rgba(255,105,180,0.15); color: #FF8FCC; }
        .char-tanty .play-btn { background: linear-gradient(135deg, #FF69B4, #C2185B); }
        .char-roti .card-character { background: rgba(46,196,182,0.15); color: #2EC4B6; }
        .char-roti .play-btn { background: linear-gradient(135deg, #2EC4B6, #00796B); }
        .char-scorcha .card-character { background: rgba(255,23,68,0.15); color: #FF5252; }
        .char-scorcha .play-btn { background: linear-gradient(135deg, #FF1744, #D50000); }
        .footer {
          position: relative; z-index: 10;
          text-align: center;
          padding: 1.5rem 2rem 2.5rem;
          color: var(--text-muted);
          font-size: 0.82rem;
        }
        .footer a { color: var(--yellow); text-decoration: none; }
        .footer a:hover { text-decoration: underline; }
        @media (max-width: 800px) {
          .games-grid { grid-template-columns: 1fr; max-width: 480px; margin: 0 auto; }
          .card-banner { height: 200px; }
        }
        @media (max-width: 480px) {
          .header { padding: 1.5rem 1rem 0.75rem; }
          .games-section { padding: 1.25rem 1rem 3rem; }
          .card-banner { height: 170px; }
          .card-body { padding: 1rem 1.15rem 1.25rem; }
        }
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

      <div className="floater" style={{ top: '8%', left: '4%', animationDelay: '0s' }}>🌴</div>
      <div className="floater" style={{ top: '25%', right: '6%', animationDelay: '3s' }}>🐠</div>
      <div className="floater" style={{ top: '55%', left: '2%', animationDelay: '6s' }}>🌊</div>
      <div className="floater" style={{ top: '75%', right: '4%', animationDelay: '9s' }}>🦜</div>

      <header className="header">
        <div className="logo-row">
          <div className="logo-text">Likkle Legends</div>
        </div>
        <p className="subtitle">Game Zone — Learn, Play, Explore the Caribbean</p>
        <Link href="/" className="home-link">← Back to likklelegends.com</Link>
      </header>

      <main className="games-section">
        <div className="games-grid">
          {games.map(game => (
            <Link key={game.id} href={game.link} className={`game-card ${game.themeClass}`}>
              <div className="card-banner">
                <div style={{
                  width: '100%',
                  height: '100%',
                  background: `linear-gradient(135deg, #132240, #0A1628)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '3rem'
                }}>
                  {game.icon}
                </div>
                <div className="banner-overlay"></div>
                <span className="banner-icon">{game.icon}</span>
              </div>
              <div className="card-body">
                <div className="card-character">{game.character}</div>
                <h2 className="card-title">{game.title}</h2>
                <p className="card-desc">{game.description}</p>
                <div className="card-tags">
                  {game.tags.map(tag => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
                <button className="play-btn">▶ Play Now</button>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <footer className="footer">
        <p>🏝️ <Link href="/">Likkle Legends</Link> — Caribbean learning that feels like home.</p>
      </footer>
    </>
  );
}