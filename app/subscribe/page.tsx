
'use client';
import { useState, useEffect } from 'react';

const PAYPAL_CLIENT_ID = 'Ad61vhtWu9GOqCMDYNpwWl1svNA_r5m1rr6ohEOA3nq7ZsejWCrLzXCZb_EFpG9BXqFSawJZTk-vioGE';

const PLANS = [
  {
    id: 'monthly_family', name: 'Family Monthly', price: 9.99, interval: 'month',
    badge: null, description: 'Billed monthly. Cancel anytime.',
    features: ['Unlimited games & stories','32+ Caribbean songs','28+ storybooks','Island learning portal','Character missions & badges'],
  },
  {
    id: 'annual_family', name: 'Family Annual', price: 79.99, interval: 'year',
    badge: 'BEST VALUE — Save 33%', description: 'Billed once per year. Best value.',
    features: ['Everything in Monthly','2 months FREE','Exclusive annual content','Family challenge access','Priority support'],
  },
];

const GIFTS = [
  { id: 'gift_3month', name: 'Gift 3 Months', price: 24.99, badge: 'GIFT' },
  { id: 'gift_annual', name: 'Gift Annual', price: 69.99, badge: 'GIFT — Best Value' },
];

declare global { interface Window { paypal?: any; } }

export default function SubscribePage() {
  const [plan, setPlan] = useState('annual_family');
  const [isGift, setIsGift] = useState(false);
  const [giftEmail, setGiftEmail] = useState('');
  const [giftName, setGiftName] = useState('');
  const [giftMsg, setGiftMsg] = useState('');
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const [paypalError, setPaypalError] = useState('');
  const [success, setSuccess] = useState(false);
  const [processing, setProcessing] = useState(false);
  const sel = PLANS.find(p => p.id === plan) || PLANS[1];

  useEffect(() => {
    if (document.getElementById('paypal-sdk')) { setPaypalLoaded(true); return; }
    const script = document.createElement('script');
    script.id = 'paypal-sdk';
    script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD&intent=capture`;
    script.onload = () => setPaypalLoaded(true);
    script.onerror = () => setPaypalError('PayPal could not load. Please refresh and try again.');
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    if (!paypalLoaded || !window.paypal || isGift) return;
    const container = document.getElementById('paypal-button-container');
    if (!container) return;
    container.innerHTML = '';
    window.paypal.Buttons({
      style: { shape: 'rect', color: 'gold', layout: 'vertical', label: 'pay', height: 50 },
      createOrder: (_data: any, actions: any) => {
        return actions.order.create({
          purchase_units: [{
            amount: {
              value: sel.price.toFixed(2),
              currency_code: 'USD',
              breakdown: { item_total: { value: sel.price.toFixed(2), currency_code: 'USD' } }
            },
            items: [{
              name: `Likkle Legends — ${sel.name}`,
              unit_amount: { value: sel.price.toFixed(2), currency_code: 'USD' },
              quantity: '1',
              category: 'DIGITAL_GOODS',
              description: sel.description,
            }],
          }],
          application_context: {
            shipping_preference: 'NO_SHIPPING',
            user_action: 'PAY_NOW',
            brand_name: 'Likkle Legends',
          },
        });
      },
      onApprove: async (_data: any, actions: any) => {
        setProcessing(true);
        try {
          const order = await actions.order.capture();
          await fetch('/api/subscriptions/confirm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId: order.id, planId: plan, amount: sel.price, payerEmail: order.payer?.email_address }),
          }).catch(() => {});
          setSuccess(true);
          setTimeout(() => { window.location.href = '/portal'; }, 2500);
        } catch {
          setPaypalError('Payment could not complete. Please try again.');
          setProcessing(false);
        }
      },
      onError: () => setPaypalError('Something went wrong. Please try again or email hello@likklelegends.com'),
    }).render('#paypal-button-container');
  }, [paypalLoaded, plan, isGift, sel]);

  const inp: React.CSSProperties = {
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10, padding: '0.85rem 1rem', color: '#fff',
    outline: 'none', fontFamily: 'inherit', width: '100%', fontSize: '0.95rem',
  };

  if (success) return (
    <main style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#0A1628,#1a2d4d)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui,sans-serif' }}>
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
        <h1 style={{ color: '#FFD23F', fontWeight: 800, fontSize: '2rem', marginBottom: '0.75rem' }}>Welcome to the Family!</h1>
        <p style={{ color: '#8EA4C8' }}>Payment confirmed. Taking you to your island portal...</p>
      </div>
    </main>
  );

  return (
    <main style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#0A1628,#1a2d4d)', padding: '3rem 1.5rem', fontFamily: 'system-ui,sans-serif' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>

        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🌴</div>
          <h1 style={{ color: '#FFD23F', fontWeight: 800, fontSize: 'clamp(1.8rem,4vw,2.5rem)', marginBottom: '0.75rem' }}>Give Your Family Caribbean Roots</h1>
          <p style={{ color: '#8EA4C8', fontSize: '1.05rem', maxWidth: 500, margin: '0 auto' }}>Unlimited access to games, storybooks, music, and a personalized island learning portal.</p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem', gap: '0.5rem' }}>
          {['For My Family', 'As a Gift 🎁'].map((t, i) => (
            <button key={t} onClick={() => setIsGift(i === 1)} style={{ padding: '0.6rem 1.5rem', borderRadius: 8, border: `1px solid ${isGift === (i === 1) ? 'rgba(46,196,182,0.6)' : 'rgba(255,255,255,0.1)'}`, background: isGift === (i === 1) ? 'rgba(46,196,182,0.15)' : 'transparent', color: isGift === (i === 1) ? '#2EC4B6' : '#8EA4C8', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>{t}</button>
          ))}
        </div>

        {!isGift ? (<>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
            {PLANS.map(p => (
              <div key={p.id} onClick={() => setPlan(p.id)} style={{ background: plan === p.id ? 'rgba(46,196,182,0.08)' : 'rgba(255,255,255,0.04)', border: `2px solid ${plan === p.id ? '#2EC4B6' : 'rgba(255,255,255,0.08)'}`, borderRadius: 18, padding: '1.75rem', cursor: 'pointer', position: 'relative', transition: 'all 0.2s' }}>
                {p.badge && <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: '#FFD23F', color: '#000', fontSize: '0.7rem', fontWeight: 800, padding: '3px 12px', borderRadius: 4, whiteSpace: 'nowrap' }}>{p.badge}</div>}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div>
                    <div style={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem' }}>{p.name}</div>
                    <div style={{ color: '#8EA4C8', fontSize: '0.8rem' }}>{p.description}</div>
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

          <div style={{ maxWidth: 440, margin: '0 auto', textAlign: 'center' }}>
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '1.75rem', marginBottom: '1rem' }}>
              <div style={{ color: '#8EA4C8', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                You&apos;re paying for <strong style={{ color: '#fff' }}>{sel.name}</strong> — <strong style={{ color: '#FFD23F' }}>${sel.price}{sel.interval === 'year' ? '/year' : '/month'}</strong>
              </div>
              {paypalError && <div style={{ color: '#FF6B6B', fontSize: '0.875rem', marginBottom: '1rem', padding: '0.75rem', background: 'rgba(255,68,68,0.1)', borderRadius: 8, lineHeight: 1.5 }}>{paypalError}</div>}
              {processing && <div style={{ color: '#FFD23F', fontSize: '0.875rem', padding: '1rem' }}>Processing your payment...</div>}
              {!paypalLoaded && !paypalError && !processing && <div style={{ color: '#8EA4C8', fontSize: '0.875rem', padding: '1rem' }}>Loading secure payment...</div>}
              <div id="paypal-button-container" style={{ display: processing ? 'none' : 'block' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
              <span>🔒</span>
              <span style={{ color: '#5A7A90', fontSize: '0.8rem' }}>Secured by PayPal. Questions? hello@likklelegends.com</span>
            </div>
          </div>
        </>) : (
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
              <a href={`mailto:hello@likklelegends.com?subject=Gift Subscription Request&body=Hi! I'd like to send a gift subscription.%0A%0ARecipient: ${giftName}%0AEmail: ${giftEmail}%0APlan: ${plan}%0AMessage: ${giftMsg}`}
                style={{ display: 'block', background: 'linear-gradient(135deg,#FFD23F,#FF6B35)', border: 'none', borderRadius: 12, padding: '1rem', color: '#000', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', textAlign: 'center', textDecoration: 'none' }}>
                🎁 Send Gift Request
              </a>
              <p style={{ color: '#5A7A90', fontSize: '0.8rem', textAlign: 'center' }}>We&apos;ll set up the gift and send you a payment link same day.</p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
