'use client';
import { useState } from 'react';

const EDGE = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/affiliate-portal`;

const TIERS = [
  { name: 'Standard', pct: '10%', req: 'Getting started', color: '#8EA4C8' },
  { name: 'Silver',   pct: '15%', req: '5+ sales/month', color: '#C0C0C0' },
  { name: 'Gold',     pct: '20%', req: '20+ sales/month', color: '#FFD23F' },
  { name: 'Platinum', pct: '25%', req: '50+ sales/month', color: '#2EC4B6' },
];

export default function AffiliatesPage() {
  const [view, setView] = useState<'overview' | 'apply' | 'portal'>('overview');
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', bio: '', website: '', instagram: '', audienceSize: '' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [token, setToken] = useState('');
  const [portal, setPortal] = useState<any>(null);

  async function apply() {
    setLoading(true);
    try {
      const res = await fetch(EDGE, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'apply', ...form }) });
      const d = await res.json();
      setResult(d);
    } catch (e: any) { setResult({ error: e.message }); }
    setLoading(false);
  }

  async function loadPortal() {
    setLoading(true);
    try {
      const res = await fetch(EDGE, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'get_portal', token }) });
      const d = await res.json();
      if (d.error) setResult(d); else setPortal(d);
    } catch (e: any) { setResult({ error: e.message }); }
    setLoading(false);
  }

  const inp: React.CSSProperties = {
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10, padding: '0.8rem 1rem', color: '#fff', width: '100%',
    outline: 'none', fontFamily: 'inherit', fontSize: '0.9rem',
  };

  return (
    <main style={{ minHeight: '100vh', background: '#0A1628', fontFamily: 'system-ui,sans-serif' }}>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg,#0A1628,#1a2d4d)', padding: '4rem 1.5rem 3rem', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🤝</div>
        <h1 style={{ color: '#FFD23F', fontWeight: 800, fontSize: 'clamp(1.8rem,4vw,2.5rem)', marginBottom: '0.75rem' }}>
          Earn by Sharing Caribbean Learning
        </h1>
        <p style={{ color: '#8EA4C8', fontSize: '1.05rem', maxWidth: 520, margin: '0 auto 2rem' }}>
          Join the Likkle Legends affiliate program. Earn 10–25% commission for every family you bring in.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => setView('apply')} style={{ background: 'linear-gradient(135deg,#2EC4B6,#00C853)', border: 'none', borderRadius: 10, padding: '0.8rem 2rem', color: '#000', fontWeight: 800, cursor: 'pointer', fontSize: '1rem' }}>
            Apply Now — Free
          </button>
          <button onClick={() => setView('portal')} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '0.8rem 2rem', color: '#8EA4C8', fontWeight: 600, cursor: 'pointer' }}>
            Access My Portal
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '3rem 1.5rem' }}>

        {/* Overview */}
        {view === 'overview' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '1rem', marginBottom: '3rem' }}>
              {TIERS.map((t, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${t.color}33`, borderRadius: 14, padding: '1.5rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: t.color, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>{t.name}</div>
                  <div style={{ color: t.color, fontWeight: 800, fontSize: '2rem', marginBottom: '0.5rem' }}>{t.pct}</div>
                  <div style={{ color: '#8EA4C8', fontSize: '0.8rem' }}>{t.req}</div>
                </div>
              ))}
            </div>
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '1.5rem', marginBottom: '2rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '1rem' }}>
                {[
                  { icon: '📝', title: 'Apply Free', desc: 'Fill out a short application. We review within 48 hours.' },
                  { icon: '🔗', title: 'Get Your Link', desc: 'Your unique tracking link. Share it anywhere.' },
                  { icon: '👨‍👩‍👧', title: 'Families Subscribe', desc: 'When someone subscribes through your link, you earn.' },
                  { icon: '💰', title: 'Get Paid Monthly', desc: 'PayPal payout every month. Minimum $25.' },
                ].map((s, i) => (
                  <div key={i} style={{ textAlign: 'center', padding: '1rem' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{s.icon}</div>
                    <div style={{ color: '#F0F4FF', fontWeight: 700, marginBottom: '0.5rem' }}>{s.title}</div>
                    <div style={{ color: '#8EA4C8', fontSize: '0.85rem', lineHeight: 1.5 }}>{s.desc}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <button onClick={() => setView('apply')} style={{ background: 'linear-gradient(135deg,#2EC4B6,#00C853)', border: 'none', borderRadius: 12, padding: '1rem 3rem', color: '#000', fontWeight: 800, fontSize: '1.1rem', cursor: 'pointer' }}>
                Apply to Become an Affiliate
              </button>
              <p style={{ color: '#5A7A90', fontSize: '0.8rem', marginTop: '1rem' }}>
                30-day cookie · Monthly PayPal payouts · No cap on earnings
              </p>
            </div>
          </>
        )}

        {/* Apply form */}
        {view === 'apply' && (
          <div style={{ maxWidth: 520, margin: '0 auto' }}>
            <button onClick={() => setView('overview')} style={{ background: 'none', border: 'none', color: '#8EA4C8', cursor: 'pointer', marginBottom: '1.5rem', fontSize: '0.9rem' }}>← Back</button>
            <h2 style={{ color: '#F0F4FF', fontWeight: 800, fontSize: '1.5rem', marginBottom: '0.5rem' }}>Affiliate Application</h2>
            <p style={{ color: '#8EA4C8', fontSize: '0.9rem', marginBottom: '2rem' }}>Takes 2 minutes. We review within 48 hours.</p>

            {result?.success ? (
              <div style={{ background: 'rgba(0,200,83,0.08)', border: '1px solid rgba(0,200,83,0.25)', borderRadius: 14, padding: '2rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🎉</div>
                <h3 style={{ color: '#00C853', fontWeight: 800, fontSize: '1.2rem', marginBottom: '0.75rem' }}>Application Submitted!</h3>
                <p style={{ color: '#8EA4C8', marginBottom: '0.75rem' }}>{result.message}</p>
                <p style={{ color: '#5A7A90', fontSize: '0.85rem' }}>Your referral code: <strong style={{ color: '#2EC4B6' }}>{result.referralCode}</strong></p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#8EA4C8', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>First Name *</label>
                    <input style={inp} value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} placeholder="First name" />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#8EA4C8', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>Last Name</label>
                    <input style={inp} value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} placeholder="Last name" />
                  </div>
                </div>
                {[
                  { k: 'email', l: 'PayPal Email (for payouts) *', ph: 'your@paypal.com', t: 'email' },
                  { k: 'instagram', l: 'Instagram handle', ph: '@yourprofile', t: 'text' },
                  { k: 'website', l: 'Website or blog URL', ph: 'https://yourblog.com', t: 'url' },
                  { k: 'audienceSize', l: 'Approximate audience size', ph: 'e.g. 5,000 followers', t: 'text' },
                ].map(({ k, l, ph, t }) => (
                  <div key={k}>
                    <label style={{ fontSize: '0.8rem', color: '#8EA4C8', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>{l}</label>
                    <input type={t} style={inp} value={(form as any)[k]} onChange={e => setForm({ ...form, [k]: e.target.value })} placeholder={ph} />
                  </div>
                ))}
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#8EA4C8', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>Tell us about your audience</label>
                  <textarea rows={3} style={{ ...inp, resize: 'vertical' }} value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} placeholder="Who follows you? Why would they love Likkle Legends?" />
                </div>
                {result?.error && (
                  <div style={{ background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.3)', borderRadius: 8, padding: '0.75rem', color: '#FF6B6B', fontSize: '0.875rem' }}>{result.error}</div>
                )}
                <button onClick={apply} disabled={loading} style={{ background: 'linear-gradient(135deg,#2EC4B6,#00C853)', border: 'none', borderRadius: 12, padding: '1rem', color: '#000', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                  {loading ? 'Submitting...' : '🤝 Submit Application'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Affiliate portal */}
        {view === 'portal' && (
          <div style={{ maxWidth: 560, margin: '0 auto' }}>
            <button onClick={() => setView('overview')} style={{ background: 'none', border: 'none', color: '#8EA4C8', cursor: 'pointer', marginBottom: '1.5rem', fontSize: '0.9rem' }}>← Back</button>
            {!portal ? (
              <div>
                <h2 style={{ color: '#F0F4FF', fontWeight: 800, fontSize: '1.4rem', marginBottom: '0.5rem' }}>Access Your Portal</h2>
                <p style={{ color: '#8EA4C8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Enter your portal access token from the email we sent you.</p>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <input style={{ ...inp, flex: 1 }} value={token} onChange={e => setToken(e.target.value)} placeholder="Your access token" onKeyDown={e => e.key === 'Enter' && loadPortal()} />
                  <button onClick={loadPortal} disabled={loading || !token} style={{ background: '#2EC4B6', border: 'none', borderRadius: 10, padding: '0.8rem 1.25rem', color: '#000', fontWeight: 800, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    {loading ? '...' : 'Access →'}
                  </button>
                </div>
                {result?.error && <p style={{ color: '#FF6B6B', fontSize: '0.875rem', marginTop: '0.75rem' }}>{result.error}</p>}
              </div>
            ) : (
              <div>
                <h2 style={{ color: '#FFD23F', fontWeight: 800, fontSize: '1.4rem', marginBottom: '1.5rem' }}>
                  Welcome back, {portal.promoter.first_name}!
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                  {[
                    { l: 'Total Earned', v: `$${(portal.promoter.total_earned || 0).toFixed(2)}`, c: '#00C853' },
                    { l: 'Pending', v: `$${(portal.promoter.pending_earnings || 0).toFixed(2)}`, c: '#FFD23F' },
                    { l: 'Total Clicks', v: portal.promoter.clicks || 0, c: '#2EC4B6' },
                    { l: 'Conversions', v: portal.promoter.conversions || 0, c: '#FF69B4' },
                  ].map((s, i) => (
                    <div key={i} style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${s.c}22`, borderRadius: 12, padding: '1rem' }}>
                      <div style={{ color: s.c, fontWeight: 800, fontSize: '1.5rem' }}>{s.v}</div>
                      <div style={{ color: '#8EA4C8', fontSize: '0.8rem' }}>{s.l}</div>
                    </div>
                  ))}
                </div>
                <div style={{ background: 'rgba(46,196,182,0.06)', border: '1px solid rgba(46,196,182,0.2)', borderRadius: 12, padding: '1rem', marginBottom: '1rem' }}>
                  <div style={{ color: '#8EA4C8', fontSize: '0.8rem', marginBottom: '0.5rem' }}>YOUR REFERRAL LINK</div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <code style={{ color: '#2EC4B6', flex: 1, fontSize: '0.875rem', wordBreak: 'break-all', fontFamily: 'monospace' }}>
                      https://likklelegends.com?ref={portal.promoter.referral_code}
                    </code>
                    <button onClick={() => navigator.clipboard?.writeText(`https://likklelegends.com?ref=${portal.promoter.referral_code}`)} style={{ background: 'rgba(46,196,182,0.1)', border: '1px solid rgba(46,196,182,0.3)', borderRadius: 6, padding: '0.4rem 0.75rem', color: '#2EC4B6', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}>
                      Copy
                    </button>
                  </div>
                </div>
                {portal.materials?.length > 0 && (
                  <div>
                    <div style={{ color: '#2EC4B6', fontWeight: 700, fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                      Marketing Materials ({portal.materials.length} ready)
                    </div>
                    {portal.materials.slice(0, 3).map((m: any, i: number) => (
                      <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '0.875rem', marginBottom: '0.5rem' }}>
                        <div style={{ color: '#F0F4FF', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.4rem' }}>{m.title}</div>
                        <button onClick={() => navigator.clipboard?.writeText(m.content?.replace('{{affiliate_link}}', `https://likklelegends.com?ref=${portal.promoter.referral_code}`))} style={{ background: 'rgba(46,196,182,0.1)', border: '1px solid rgba(46,196,182,0.3)', borderRadius: 5, padding: '0.3rem 0.75rem', color: '#2EC4B6', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>
                          Copy Text
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
