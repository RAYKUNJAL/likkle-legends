'use client';
import { useState } from 'react';

const PLANS = [
  {
    id: 'monthly_family', name: 'Family Monthly', price: 9.99, interval: 'month', badge: null,
    features: ['Unlimited games & stories', '32+ Caribbean songs', '28+ storybooks', 'Island learning portal', 'Character missions & badges'],
  },
  {
    id: 'annual_family', name: 'Family Annual', price: 79.99, interval: 'year', badge: 'BEST VALUE — Save 33%',
    features: ['Everything in Monthly', '2 months FREE', 'Exclusive annual content', 'Family challenge access', 'Priority support'],
  },
];

const GIFTS = [
  { id: 'gift_3month', name: 'Gift 3 Months', price: 24.99, badge: 'GIFT' },
  { id: 'gift_annual', name: 'Gift Annual', price: 69.99, badge: 'GIFT — Best Value' },
];

export default function SubscribePage() {
  const [plan, setPlan] = useState('annual_family');
  const [isGift, setIsGift] = useState(false);
  const [giftEmail, setGiftEmail] = useState('');
  const [giftName, setGiftName] = useState('');
  const [giftMsg, setGiftMsg] = useState('');

  const sel = PLANS.find(p => p.id === plan) || PLANS[1];

  const inp: React.CSSProperties = {
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10, padding: '0.85rem 1rem', color: '#fff',
    outline: 'none', fontFamily: 'inherit', width: '100%',
  };

  return (
    <main style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#0A1628,#1a2d4d)', padding: '3rem 1.5rem', fontFamily: 'system-ui,sans-serif' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🌴</div>
          <h1 style={{ color: '#FFD23F', fontWeight: 800, fontSize: 'clamp(1.8rem,4vw,2.5rem)', marginBottom: '0.75rem' }}>
            Give Your Family Caribbean Roots
          </h1>
          <p style={{ color: '#8EA4C8', fontSize: '1.05rem', maxWidth: 500, margin: '0 auto' }}>
            Unlimited access to games, storybooks, music, and a personalized island learning portal.
          </p>
        </div>

        {/* Gift toggle */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem', gap: '0.5rem' }}>
          {['For My Family', 'As a Gift 🎁'].map((t, i) => (
            <button key={t} onClick={() => setIsGift(i === 1)} style={{ padding: '0.6rem 1.5rem', borderRadius: 8, border: `1px solid ${isGift === (i === 1) ? 'rgba(46,196,182,0.6)' : 'rgba(255,255,255,0.1)'}`, background: isGift === (i === 1) ? 'rgba(46,196,182,0.15)' : 'transparent', color: isGift === (i === 1) ? '#2EC4B6' : '#8EA4C8', fontWeight: 600, cursor: 'pointer' }}>{t}</button>
          ))}
        </div>

        {!isGift ? (
          <>
            {/* Plan cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
              {PLANS.map(p => (
                <div key={p.id} onClick={() => setPlan(p.id)} style={{ background: plan === p.id ? 'rgba(46,196,182,0.08)' : 'rgba(255,255,255,0.04)', border: `2px solid ${plan === p.id ? '#2EC4B6' : 'rgba(255,255,255,0.08)'}`, borderRadius: 18, padding: '1.75rem', cursor: 'pointer', position: 'relative' }}>
                  {p.badge && (
                    <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: '#FFD23F', color: '#000', fontSize: '0.7rem', fontWeight: 800, padding: '3px 12px', borderRadius: 4, whiteSpace: 'nowrap' }}>{p.badge}</div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div>
                      <div style={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem' }}>{p.name}</div>
                      <div style={{ color: '#8EA4C8', fontSize: '0.85rem' }}>Per {p.interval}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: '#FFD23F', fontWeight: 800, fontSize: '1.75rem', lineHeight: 1 }}>${p.price}</div>
                      {p.interval === 'year' && <div style={{ color: '#2EC4B6', fontSize: '0.75rem' }}>${(p.price / 12).toFixed(2)}/mo</div>}
                    </div>
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {p.features.map((f, i) => (
                      <li key={i} style={{ color: '#C8D8E8', fontSize: '0.875rem', padding: '0.3rem 0', display: 'flex', gap: '0.5rem' }}>
                        <span style={{ color: '#2EC4B6' }}>✓</span>{f}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* PayPal button area */}
            <div style={{ maxWidth: 420, margin: '0 auto', textAlign: 'center' }}>
              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '1.75rem', marginBottom: '1rem' }}>
                <div style={{ color: '#8EA4C8', fontSize: '0.875rem', marginBottom: '1rem' }}>
                  Starting your <strong style={{ color: '#fff' }}>{sel.name}</strong> at{' '}
                  <strong style={{ color: '#FFD23F' }}>${sel.price}/{sel.interval}</strong>
                </div>
                {/* PayPal button renders here */}
                <div id="paypal-button-container" style={{ minHeight: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <p style={{ color: '#5A7A90', fontSize: '0.875rem' }}>
                    Add <code>NEXT_PUBLIC_PAYPAL_CLIENT_ID</code> to Vercel env, then load PayPal SDK in layout.tsx
                  </p>
                </div>
              </div>
              <p style={{ color: '#5A7A90', fontSize: '0.75rem' }}>Cancel anytime. No hidden fees. Secure payment via PayPal.</p>
            </div>
          </>
        ) : (
          /* Gift section */
          <div style={{ maxWidth: 520, margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
              {GIFTS.map(g => (
                <div key={g.id} onClick={() => setPlan(g.id)} style={{ background: plan === g.id ? 'rgba(255,210,63,0.08)' : 'rgba(255,255,255,0.04)', border: `2px solid ${plan === g.id ? '#FFD23F' : 'rgba(255,255,255,0.08)'}`, borderRadius: 14, padding: '1.25rem', cursor: 'pointer', textAlign: 'center' }}>
                  <div style={{ color: '#FFD23F', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.1em', marginBottom: '0.5rem' }}>{g.badge}</div>
                  <div style={{ color: '#fff', fontWeight: 700 }}>{g.name}</div>
                  <div style={{ color: '#FFD23F', fontWeight: 800, fontSize: '1.5rem' }}>${g.price}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input style={inp} value={giftName} onChange={e => setGiftName(e.target.value)} placeholder="Recipient's name" />
              <input type="email" style={inp} value={giftEmail} onChange={e => setGiftEmail(e.target.value)} placeholder="Recipient's email" />
              <textarea style={{ ...inp, resize: 'vertical' }} rows={3} value={giftMsg} onChange={e => setGiftMsg(e.target.value)} placeholder="Personal message (optional)" />
              <div id="paypal-gift-button" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '1.5rem', textAlign: 'center', color: '#5A7A90', fontSize: '0.875rem' }}>
                PayPal gift payment — requires PayPal SDK setup in layout.tsx
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
