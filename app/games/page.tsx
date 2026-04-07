'use client';
import { useEffect } from 'react';
import Link from 'next/link';

const GAMES = [
  {
    id: 'island-hop',
    href: '/games/island-hop.html',
    char: 'Mango Moko',
    charEmoji: '🦋',
    title: "Mango's Island Hop",
    desc: 'Hop across the Caribbean islands answering trivia about flags, capitals, and fun facts with Mango Moko as your guide.',
    tags: ['Geography', 'Trivia', 'Ages 4-8'],
    bannerIcon: '🏝️',
    image: '/games/images/mango_moko.png',
    theme: 'mango',
  },
  {
    id: 'tantys-kitchen',
    href: '/games/tantys-kitchen.html',
    char: 'Tanty Spice',
    charEmoji: '👵🏾',
    title: "Tanty's Kitchen",
    desc: 'Drag the right ingredients into the pot and cook 5 real Caribbean dishes with Tanty Spice guiding every step.',
    tags: ['Cooking', 'Sorting', 'Ages 3-8'],
    bannerIcon: '🍲',
    image: '/games/images/tanty_spice_avatar.jpg',
    theme: 'tanty',
  },
  {
    id: 'math-market',
    href: '/games/math-market.html',
    char: 'R.O.T.I.',
    charEmoji: '🤖',
    title: "R.O.T.I.'s Math Market",
    desc: 'Count fruit, add prices, and make change at a Caribbean market stall. Math gets tastier with R.O.T.I.',
    tags: ['Math', 'Counting', 'Ages 4-8'],
    bannerIcon: '🧮',
    image: '/games/images/roti-new.jpg',
    theme: 'roti',
  },
  {
    id: 'spelling-blaze',
    href: '/games/spelling-blaze.html',
    char: 'Scorcha Pepper',
    charEmoji: '🌶️',
    title: "Scorcha's Spelling Blaze",
    desc: 'Spell Caribbean words before the fire timer burns out. Race Scorcha Pepper to earn blazing badges.',
    tags: ['Spelling', 'Speed', 'Ages 5-8'],
    bannerIcon: '🔥',
    image: '/games/images/scorcha_pepper.jpg',
    theme: 'scorcha',
  },
];

const THEME: Record<string, { badge: string; badgeText: string; btn: string }> = {
  mango:   { badge: 'rgba(0,200,83,0.15)',   badgeText: '#69F0AE', btn: 'linear-gradient(135deg,#00C853,#2E7D32)' },
  tanty:   { badge: 'rgba(255,105,180,0.15)', badgeText: '#FF8FCC', btn: 'linear-gradient(135deg,#FF69B4,#C2185B)' },
  roti:    { badge: 'rgba(46,196,182,0.15)',  badgeText: '#2EC4B6', btn: 'linear-gradient(135deg,#2EC4B6,#00796B)' },
  scorcha: { badge: 'rgba(255,23,68,0.15)',   badgeText: '#FF5252', btn: 'linear-gradient(135deg,#FF1744,#D50000)' },
};

export default function GamesPage() {
  // Generate stars on mount
  useEffect(() => {
    const container = document.getElementById('ll-stars');
    if (!container) return;
    for (let i = 0; i < 55; i++) {
      const s = document.createElement('div');
      const size = (Math.random() * 2 + 1) + 'px';
      Object.assign(s.style, {
        position: 'absolute',
        width: size, height: size,
        background: '#fff',
        borderRadius: '50%',
        left: Math.random() * 100 + '%',
        top: Math.random() * 55 + '%',
        opacity: '0.15',
        animation: `llTwinkle ${Math.random() * 3 + 2}s ease-in-out ${Math.random() * 3}s infinite alternate`,
      });
      container.appendChild(s);
    }
  }, []);

  return (
    <>
      <style>{`
        @import url('https://api.fontshare.com/v2/css?f[]=chillax@400,500,600,700&f[]=general-sans@400,500,600&display=swap');
        @keyframes llTwinkle { 0%{opacity:0.1} 100%{opacity:0.85} }
        @keyframes llFloat {
          0%,100%{transform:translateY(0) rotate(0deg)}
          25%{transform:translateY(-28px) rotate(5deg)}
          50%{transform:translateY(-10px) rotate(-3deg)}
          75%{transform:translateY(-22px) rotate(4deg)}
        }
        @keyframes llHoverIn {
          from{transform:translateY(-8px) scale(1.015)}
        }
        .ll-card {
          background:#132240;
          border-radius:20px;
          overflow:hidden;
          cursor:pointer;
          transition:transform 0.35s cubic-bezier(0.16,1,0.3,1),box-shadow 0.35s ease;
          border:2px solid rgba(255,255,255,0.05);
          text-decoration:none;
          color:inherit;
          display:flex;
          flex-direction:column;
        }
        .ll-card:hover {
          transform:translateY(-8px) scale(1.015);
          box-shadow:0 24px 60px rgba(0,0,0,0.45);
        }
        .ll-card:hover .ll-banner-img {
          transform:scale(1.08);
        }
        .ll-banner-img {
          width:100%;height:100%;
          object-fit:cover;
          transition:transform 0.5s cubic-bezier(0.16,1,0.3,1);
        }
        .ll-play-btn:hover { transform:scale(1.03); filter:brightness(1.1); }
        @media(max-width:800px){
          .ll-grid { grid-template-columns:1fr !important; max-width:480px; margin:0 auto; }
          .ll-banner { height:200px !important; }
        }
        @media(max-width:480px){
          .ll-banner { height:170px !important; }
        }
      `}</style>

      {/* Fixed ocean background */}
      <div style={{
        position:'fixed', inset:0, zIndex:0,
        background:'linear-gradient(180deg,#0A1628 0%,#0D2137 40%,#0F2B4A 70%,#134A6E 100%)',
      }}>
        <div style={{
          position:'absolute', bottom:0, left:0, right:0, height:'40%',
          background:'radial-gradient(ellipse at 50% 100%,rgba(1,180,160,0.12) 0%,transparent 70%)',
        }}/>
      </div>

      {/* Stars */}
      <div id="ll-stars" style={{position:'fixed',inset:0,zIndex:0,pointerEvents:'none'}}/>

      {/* Floating decorations */}
      {[
        {top:'8%',left:'4%',delay:'0s',icon:'🌴'},
        {top:'25%',right:'6%',delay:'3s',icon:'🐠'},
        {top:'55%',left:'2%',delay:'6s',icon:'🌊'},
        {top:'75%',right:'4%',delay:'9s',icon:'🦜'},
      ].map((f,i)=>(
        <div key={i} style={{
          position:'fixed',
          top:f.top, left:f.left||undefined, right:(f as any).right||undefined,
          fontSize:'2rem', opacity:0.07, pointerEvents:'none', zIndex:1,
          animation:`llFloat 20s ease-in-out ${f.delay} infinite`,
        }}>{f.icon}</div>
      ))}

      {/* Header */}
      <header style={{position:'relative',zIndex:10,padding:'2.5rem 1.5rem 1rem',textAlign:'center'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'0.75rem',marginBottom:'0.5rem'}}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/games/images/logo.png"
            alt="Likkle Legends"
            style={{width:52,height:52,borderRadius:14,objectFit:'cover',boxShadow:'0 4px 20px rgba(255,210,63,0.25)'}}
          />
          <h1 style={{
            fontFamily:'Chillax,sans-serif',
            fontSize:'clamp(1.8rem,4vw,2.8rem)',
            fontWeight:700,
            background:'linear-gradient(135deg,#FFD23F,#FF6B35)',
            WebkitBackgroundClip:'text',
            WebkitTextFillColor:'transparent',
            backgroundClip:'text',
          }}>Likkle Legends</h1>
        </div>
        <p style={{fontFamily:'Chillax,sans-serif',fontSize:'clamp(0.95rem,2.2vw,1.25rem)',color:'#8EA4C8',fontWeight:500,marginBottom:'0.25rem'}}>
          Game Zone — Learn, Play, Explore the Caribbean
        </p>
        <Link href="/" style={{display:'inline-block',marginTop:'0.5rem',color:'#8EA4C8',fontSize:'0.85rem',textDecoration:'none'}}>
          ← Back to likklelegends.com
        </Link>
      </header>

      {/* Games Grid */}
      <main style={{position:'relative',zIndex:10,maxWidth:1200,margin:'0 auto',padding:'2rem 1.5rem 4rem'}}>
        <div className="ll-grid" style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'1.5rem'}}>
          {GAMES.map(game => {
            const t = THEME[game.theme];
            return (
              <a key={game.id} href={game.href} className="ll-card">
                {/* Banner */}
                <div className="ll-banner" style={{height:220,position:'relative',overflow:'hidden',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className="ll-banner-img"
                    src={game.image}
                    alt={game.char}
                  />
                  <div style={{
                    position:'absolute',inset:0,
                    background:'linear-gradient(0deg,#132240 0%,transparent 60%)',
                  }}/>
                  <span style={{
                    position:'absolute',top:12,right:12,
                    fontSize:'2rem',
                    filter:'drop-shadow(0 2px 8px rgba(0,0,0,0.4))',
                    zIndex:2,
                  }}>{game.bannerIcon}</span>
                </div>

                {/* Card body */}
                <div style={{padding:'1.25rem 1.5rem 1.5rem',flex:1,display:'flex',flexDirection:'column'}}>
                  {/* Character badge */}
                  <div style={{
                    display:'inline-flex',alignItems:'center',gap:'0.35rem',
                    fontSize:'0.78rem',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.06em',
                    marginBottom:'0.5rem',padding:'0.2rem 0.7rem',borderRadius:100,
                    width:'fit-content',
                    background:t.badge,color:t.badgeText,
                  }}>
                    {game.charEmoji} {game.char}
                  </div>

                  <h2 style={{
                    fontFamily:'Chillax,sans-serif',
                    fontSize:'clamp(1.15rem,2vw,1.4rem)',
                    fontWeight:700,marginBottom:'0.35rem',lineHeight:1.2,
                    color:'#F0F4FF',
                  }}>{game.title}</h2>

                  <p style={{fontSize:'0.88rem',color:'#8EA4C8',lineHeight:1.5,marginBottom:'0.75rem',flex:1}}>
                    {game.desc}
                  </p>

                  {/* Tags */}
                  <div style={{display:'flex',flexWrap:'wrap',gap:'0.35rem',marginBottom:'1rem'}}>
                    {game.tags.map(tag=>(
                      <span key={tag} style={{
                        fontSize:'0.7rem',fontWeight:600,
                        padding:'0.18rem 0.55rem',borderRadius:100,
                        background:'rgba(255,255,255,0.06)',color:'#8EA4C8',
                      }}>{tag}</span>
                    ))}
                  </div>

                  {/* Play button */}
                  <div className="ll-play-btn" style={{
                    display:'inline-flex',alignItems:'center',justifyContent:'center',
                    gap:'0.4rem',padding:'0.65rem 1.4rem',borderRadius:12,
                    fontFamily:'Chillax,sans-serif',fontWeight:600,fontSize:'0.95rem',
                    color:'#fff',background:t.btn,
                    transition:'transform 0.2s,filter 0.2s',
                    width:'100%',textAlign:'center',cursor:'pointer',
                  }}>
                    ▶ Play Now
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer style={{position:'relative',zIndex:10,textAlign:'center',padding:'1.5rem 2rem 2.5rem',color:'#8EA4C8',fontSize:'0.82rem'}}>
        <p>🏝️ <Link href="/" style={{color:'#FFD23F',textDecoration:'none'}}>Likkle Legends</Link> — Caribbean learning that feels like home.</p>
      </footer>
    </>
  );
}
