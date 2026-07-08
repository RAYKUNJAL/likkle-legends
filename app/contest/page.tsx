'use client';
import { useState, useEffect } from 'react';

const EDGE = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/contest-engine`;

export default function ContestPage() {
  const [step, setStep] = useState<'enter' | 'share' | 'board'>('enter');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [entry, setEntry] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [board, setBoard] = useState<any[]>([]);
  const [refCode, setRefCode] = useState('');

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    setRefCode(p.get('ref') || '');
  }, []);

  async function enter() {
    if (!email || !firstName) return setError('Enter your name and email to continue');
    setLoading(true); setError('');
    try {
      const res = await fetch(EDGE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'enter',
          email: email.toLowerCase(),
          firstName,
          referralCode: refCode || undefined,
        }),
      });
      const d = await res.json();
      if (d.error) throw new Error(d.error);
      setEntry(d.entry);
      setStep('share');
    } catch (e: any) { setError(e.message || 'Something went wrong'); }
    setLoading(false);
  }

  async function share(platform: string) {
    if (!entry) return;
    const shareUrl = `https://www.likklelegends.com/contest?ref=${entry.entry_code}`;
    const msg = `I just entered to WIN a FREE year of Caribbean learning for my family! 🌴 Enter here: ${shareUrl}`;
    if (platform === 'whatsapp') window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`);
    else if (platform === 'facebook') window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`);
    else if (platform === 'instagram') { await navigator.clipboard.writeText(msg); alert('Caption copied! Paste on Instagram.'); }
    else { await navigator.clipboard.writeText(shareUrl); alert('Link copied!'); }
    fetch(EDGE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'share', entryId: entry.id, platform }),
    });
  }

  async function loadBoard() {
    const res = await fetch(EDGE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'leaderboard' }),
    });
    const d = await res.json();
    setBoard(d.leaderboard || []);
    setStep('board');
  }

  const prizes = [
    { place: '🥇 1st Place', prize: '1 Full Year Free ($119.88)', winners: '1 winner' },
    { place: '🥈 2nd–4th', prize: '6 Months Free ($59.94)', winners: '3 winners' },
    { place: '🥉 5th–14th', prize: '3 Months Free ($29.97)', winners: '10 winners' },
  ];

  const S: Record<string, React.CSSProperties> = {
    page: {
      minHeight: '100vh',
      background: 'linear-gradient(160deg,#0A1628 0%,#1a2d4d 60%,#0e3a5e 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '2rem', fontFamily: 'system-ui,sans-serif',
    },
    card: {
      maxWidth: 540, width: '100%',
      background: 'rgba(255,255,255,0.05)',
      borderRadius: 24, padding: '2.5rem',
      border: '1px solid rgba(255,255,255,0.09)',
    },
    inp: {
      background: 'rgba(255,255,255,0.07)',
      border: '1px solid rgba(255,255,255,0.13)',
      borderRadius: 12, padding: '0.9rem 1rem',
      color: '#fff', fontSize: '1rem', outline: 'none', width: '100%',
      fontFamily: 'inherit',
    },
    btn: {
      background: 'linear-gradient(135deg,#FFD23F,#FF6B35)',
      border: 'none', borderRadius: 12, padding: '1rem',
      color: '#000', fontWeight: 800, fontSize: '1.05rem',
      cursor: 'pointer', width: '100%', fontFamily: 'inherit',
    },
  };

  return (
    <main style={S.page}>
      <div style={S.card}>

        {step === 'enter' && <>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🏝️</div>
            <h1 style={{ color: '#FFD23F', fontWeight: 800, fontSize: 'clamp(1.5rem,4vw,2rem)', marginBottom: '0.75rem' }}>
              Win a Year of Caribbean Learning!
            </h1>
            <p style={{ color: '#8EA4C8', fontSize: '0.95rem', lineHeight: 1.6 }}>
              Enter FREE. Share to earn bonus entries and climb the leaderboard.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', marginBottom: '1.5rem' }}>
            <input style={S.inp} value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Your first name" />
            <input style={S.inp} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" onKeyDown={e => e.key === 'Enter' && enter()} />
            {error && <p style={{ color: '#FF6B6B', fontSize: '0.875rem', textAlign: 'center' }}>{error}</p>}
            <button style={S.btn} onClick={enter} disabled={loading}>
              {loading ? 'Entering...' : '🎉 Enter for FREE'}
            </button>
            <p style={{ color: '#5A7A90', fontSize: '0.75rem', textAlign: 'center' }}>
              No purchase necessary. Open to all. 30-day contest.
            </p>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '1.25rem' }}>
            <div style={{ color: '#8EA4C8', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem', fontWeight: 700 }}>Prizes</div>
            {prizes.map((p, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div>
                  <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem' }}>{p.place}</div>
                  <div style={{ color: '#5A7A90', fontSize: '0.8rem' }}>{p.winners}</div>
                </div>
                <div style={{ color: '#FFD23F', fontWeight: 700, fontSize: '0.875rem' }}>{p.prize}</div>
              </div>
            ))}
          </div>
          <button onClick={loadBoard} style={{ marginTop: '1rem', background: 'none', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '0.6rem', color: '#5A7A90', fontSize: '0.8rem', cursor: 'pointer', width: '100%' }}>
            📊 View Leaderboard
          </button>
        </>}

        {step === 'share' && entry && <>
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎊</div>
            <h2 style={{ color: '#FFD23F', fontWeight: 800, fontSize: '1.5rem', marginBottom: '0.5rem' }}>
              You&apos;re in, {firstName}!
            </h2>
            <p style={{ color: '#8EA4C8', fontSize: '0.9rem' }}>Share to earn +3 bonus points each time</p>
          </div>

          <div style={{ background: 'rgba(255,210,63,0.08)', border: '1px solid rgba(255,210,63,0.25)', borderRadius: 14, padding: '1.25rem', marginBottom: '1.5rem', textAlign: 'center' }}>
            <div style={{ color: '#FFD23F', fontWeight: 800, fontSize: '2.5rem', lineHeight: 1 }}>{entry.total_points || 10}</div>
            <div style={{ color: '#8EA4C8', fontSize: '0.8rem', marginTop: '0.4rem' }}>points · +3 per share · +5 when a friend enters</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
            {[['whatsapp', '🟢 WhatsApp'], ['facebook', '🔵 Facebook'], ['instagram', '📷 Instagram'], ['copy', '🔗 Copy Link']].map(([p, l]) => (
              <button key={p} onClick={() => share(p)} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '0.8rem', color: '#fff', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}>{l}</button>
            ))}
          </div>
          <button onClick={loadBoard} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '0.6rem', color: '#8EA4C8', fontSize: '0.8rem', cursor: 'pointer', width: '100%' }}>📊 View Leaderboard</button>
        </>}

        {step === 'board' && <>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ color: '#FFD23F', fontWeight: 800, fontSize: '1.5rem' }}>🏆 Leaderboard</h2>
          </div>
          {board.length === 0
            ? <p style={{ color: '#8EA4C8', textAlign: 'center', padding: '2rem' }}>Be the first to enter!</p>
            : board.slice(0, 15).map((e, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ fontWeight: 800, color: i < 3 ? '#FFD23F' : '#5A7A90', minWidth: 28 }}>
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                </span>
                <span style={{ flex: 1, color: '#fff', fontSize: '0.9rem' }}>{e.display_name}</span>
                <span style={{ color: '#FFD23F', fontWeight: 700, fontSize: '0.9rem' }}>{e.total_points} pts</span>
              </div>
            ))
          }
          <button onClick={() => setStep('enter')} style={{ ...S.btn, marginTop: '1.5rem' }}>Enter Contest Free</button>
        </>}

      </div>
    </main>
  );
}
