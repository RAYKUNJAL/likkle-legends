'use client';
import { useState, useEffect } from 'react';

const EDGE = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/lime-marketplace`;
const CATS = ['All', "Children's Books", 'Educational Games', 'Music & Audio', 'Printables', 'Digital Apps', 'Courses', 'Art & Crafts', 'Services'];

export default function LimePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [cat, setCat] = useState('All');
  const [loading, setLoading] = useState(true);
  const [showApply, setShowApply] = useState(false);
  const [applied, setApplied] = useState(false);
  const [applying, setApplying] = useState(false);
  const [form, setForm] = useState({ displayName: '', bio: '', email: '', islandOrigin: '', instagram: '' });

  useEffect(() => { load(); }, [cat]);

  async function load() {
    setLoading(true);
    try {
      const body: any = { action: 'list' };
      if (cat !== 'All') body.category = cat;
      const res = await fetch(EDGE, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const d = await res.json();
      setProducts(d.products || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  async function applyCreator() {
    setApplying(true);
    try {
      const res = await fetch(EDGE, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'apply_creator', ...form }) });
      const d = await res.json();
      if (d.success) setApplied(true);
    } catch (e) { console.error(e); }
    setApplying(false);
  }

  const inp: React.CSSProperties = {
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8, padding: '0.7rem 0.9rem', color: '#fff', width: '100%',
    outline: 'none', fontFamily: 'inherit', fontSize: '0.9rem',
  };

  return (
    <main style={{ minHeight: '100vh', background: '#0A1628', fontFamily: 'system-ui,sans-serif' }}>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg,#0A1628,#1a2d4d)', padding: '4rem 1.5rem 3rem', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🍋</div>
        <h1 style={{ color: '#FFD23F', fontWeight: 800, fontSize: 'clamp(2rem,5vw,3rem)', marginBottom: '0.75rem' }}>The Lime</h1>
        <p style={{ color: '#8EA4C8', fontSize: '1.05rem', maxWidth: 520, margin: '0 auto 1.5rem' }}>
          Where Caribbean creators share their best work. Books, games, music, and more — all built from the same cultural roots as Likkle Legends.
        </p>
        <button onClick={() => setShowApply(true)} style={{ background: 'rgba(255,105,180,0.15)', border: '1px solid rgba(255,105,180,0.4)', borderRadius: 10, padding: '0.7rem 1.5rem', color: '#FF69B4', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem' }}>
          🎨 Sell Your Work
        </button>
      </div>

      {/* Category filter */}
      <div style={{ padding: '1rem 1.5rem', overflowX: 'auto', display: 'flex', gap: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        {CATS.map(c => (
          <button key={c} onClick={() => setCat(c)} style={{ padding: '0.5rem 1rem', borderRadius: 8, whiteSpace: 'nowrap', border: `1px solid ${cat === c ? 'rgba(255,105,180,0.5)' : 'rgba(255,255,255,0.08)'}`, background: cat === c ? 'rgba(255,105,180,0.1)' : 'transparent', color: cat === c ? '#FF69B4' : '#8EA4C8', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>{c}</button>
        ))}
      </div>

      {/* Products */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.5rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', color: '#8EA4C8', padding: '3rem' }}>Loading The Lime...</div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🍋</div>
            <h2 style={{ color: '#FFD23F', fontWeight: 800, marginBottom: '0.75rem' }}>First creators coming soon!</h2>
            <p style={{ color: '#8EA4C8', maxWidth: 400, margin: '0 auto 1.5rem' }}>
              The Lime is just opening. Are you a Caribbean creator? Be one of the first to list your work.
            </p>
            <button onClick={() => setShowApply(true)} style={{ background: 'linear-gradient(135deg,#FF69B4,#C2185B)', border: 'none', borderRadius: 12, padding: '0.9rem 2rem', color: '#fff', fontWeight: 800, cursor: 'pointer', fontSize: '1rem' }}>
              Apply as a Creator
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: '1.25rem' }}>
            {products.map(p => (
              <div key={p.id} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, overflow: 'hidden', cursor: 'pointer' }}>
                <div style={{ height: 160, background: 'rgba(255,105,180,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>
                  {p.cover_image_url ? <img src={p.cover_image_url} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🍋'}
                </div>
                <div style={{ padding: '1rem' }}>
                  <div style={{ fontSize: '0.75rem', color: '#FF69B4', fontWeight: 600, marginBottom: '0.3rem' }}>{p.category}</div>
                  <h3 style={{ color: '#F0F4FF', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.5rem', lineHeight: 1.3 }}>{p.title}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ color: '#FFD23F', fontWeight: 800, fontSize: '1.1rem' }}>${p.price_usd}</span>
                    <button style={{ background: 'linear-gradient(135deg,#FF69B4,#C2185B)', border: 'none', borderRadius: 7, padding: '0.45rem 1rem', color: '#fff', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>Buy Now</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Creator apply modal */}
      {showApply && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div style={{ background: '#0E1829', border: '1px solid rgba(255,105,180,0.2)', borderRadius: 20, padding: '2rem', maxWidth: 480, width: '100%' }}>
            {applied ? (
              <div style={{ textAlign: 'center', padding: '1rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
                <h3 style={{ color: '#FFD23F', fontWeight: 800, fontSize: '1.3rem', marginBottom: '0.75rem' }}>Application Received!</h3>
                <p style={{ color: '#8EA4C8' }}>We&apos;ll review within 3 business days and reach out to get you set up.</p>
                <button onClick={() => { setShowApply(false); setApplied(false); }} style={{ marginTop: '1.5rem', background: 'rgba(255,105,180,0.15)', border: '1px solid rgba(255,105,180,0.3)', borderRadius: 10, padding: '0.7rem 1.5rem', color: '#FF69B4', fontWeight: 700, cursor: 'pointer' }}>Close</button>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3 style={{ color: '#FF69B4', fontWeight: 800, fontSize: '1.2rem' }}>Apply as a Creator</h3>
                  <button onClick={() => setShowApply(false)} style={{ background: 'none', border: 'none', color: '#8EA4C8', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                  {[
                    { k: 'displayName', l: 'Your name / brand', ph: 'e.g. Auntie Merle Books' },
                    { k: 'email', l: 'Contact email', ph: 'your@email.com' },
                    { k: 'islandOrigin', l: 'Island origin', ph: 'e.g. Trinidad & Tobago' },
                    { k: 'instagram', l: 'Instagram (optional)', ph: '@yourcreativepage' },
                  ].map(({ k, l, ph }) => (
                    <div key={k}>
                      <label style={{ fontSize: '0.8rem', color: '#8EA4C8', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>{l}</label>
                      <input style={inp} value={(form as any)[k]} onChange={e => setForm({ ...form, [k]: e.target.value })} placeholder={ph} />
                    </div>
                  ))}
                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#8EA4C8', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>What do you create?</label>
                    <textarea style={{ ...inp, resize: 'vertical' }} rows={3} value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} placeholder="Books, games, music — tell us what you make and who it's for" />
                  </div>
                  <button onClick={applyCreator} disabled={applying} style={{ background: 'linear-gradient(135deg,#FF69B4,#C2185B)', border: 'none', borderRadius: 10, padding: '0.9rem', color: '#fff', fontWeight: 800, cursor: 'pointer', fontSize: '1rem' }}>
                    {applying ? 'Submitting...' : '🍋 Submit Application'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
