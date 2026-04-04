'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';

// Characters to cycle through for social proof
const CHARACTERS = [
  { name: 'R.O.T.I.', emoji: '🤖', subject: 'Math & Coding' },
  { name: 'Tanty Spice', emoji: '👩‍🍳', subject: 'Cooking & Culture' },
  { name: 'Dilly Doubles', emoji: '🐠', subject: 'Geography' },
  { name: 'Steelpan Sam', emoji: '🥁', subject: 'Music & Heritage' },
];

const ISLANDS = [
  'Trinidad & Tobago', 'Jamaica', 'Barbados', 'Guyana', 'St. Lucia',
  'Grenada', 'Antigua', 'St. Vincent', 'Dominica', 'Bahamas',
  'Haiti', 'Dominican Republic', 'Belize', 'Puerto Rico', 'Other'
];

const TESTIMONIALS = [
  { quote: "My daughter won't put it down! She's learning about our Trinidadian roots.", author: 'Kezia M.', location: 'Brooklyn, NY' },
  { quote: "Finally an app that celebrates where we're from. My son asks to play every day.", author: 'Marcus T.', location: 'Miami, FL' },
  { quote: "The stories are so culturally rich. My kids are proud of their Caribbean heritage.", author: 'Simone R.', location: 'Toronto, CA' },
];

export default function FreeTrialPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<'capture' | 'personalize' | 'success'>('capture');
  const [email, setEmail] = useState('');
  const [parentName, setParentName] = useState('');
  const [childName, setChildName] = useState('');
  const [island, setIsland] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [charIdx, setCharIdx] = useState(0);
  const [testimonialIdx, setTestimonialIdx] = useState(0);

  // Source tracking from ad
  const adSource = searchParams?.get('utm_source') || 'direct';
  const adCharacter = searchParams?.get('char') || 'roti';

  // Cycle characters
  useEffect(() => {
    const t = setInterval(() => setCharIdx(i => (i + 1) % CHARACTERS.length), 3000);
    return () => clearInterval(t);
  }, []);

  // Cycle testimonials
  useEffect(() => {
    const t = setInterval(() => setTestimonialIdx(i => (i + 1) % TESTIMONIALS.length), 4000);
    return () => clearInterval(t);
  }, []);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    setStep('personalize');
    setError('');
  };

  const handlePersonalize = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Create account via Supabase signup
      const res = await fetch('/api/auth/free-trial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          parentName,
          childName,
          island,
          source: adSource,
          adCharacter,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setStep('success');
        // Fire Meta Pixel Lead event
        if (typeof window !== 'undefined' && (window as any).fbq) {
          (window as any).fbq('track', 'Lead', { content_name: 'free_trial_signup', currency: 'USD', value: 0 });
        }
        // Redirect to portal after 2s
        setTimeout(() => router.push('/portal'), 2000);
      } else {
        // If account already exists, redirect to login
        if (data.error?.includes('already') || data.error?.includes('exists')) {
          router.push(`/login?email=${encodeURIComponent(email)}&redirect=/portal`);
        } else {
          setError(data.error || 'Something went wrong. Please try again.');
        }
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const char = CHARACTERS[charIdx];
  const testimonial = TESTIMONIALS[testimonialIdx];

  return (
    <div className="min-h-screen bg-[#060D1F] text-white flex flex-col">
      {/* ── Nav ────────────────────────────────────────────────────────── */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <a href="/" className="flex items-center gap-2">
          <span className="text-2xl font-black text-white">Likkle Legends</span>
          <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">FREE</span>
        </a>
        <div className="text-white/40 text-sm hidden sm:block">
          🔒 No credit card required
        </div>
      </nav>

      <div className="flex-1 flex flex-col lg:flex-row">
        {/* ── Left — Form ────────────────────────────────────────────── */}
        <div className="flex-1 flex items-center justify-center px-6 py-12 lg:py-20">
          <div className="w-full max-w-md">

            {/* Step: Email capture */}
            {step === 'capture' && (
              <div className="space-y-8">
                <div>
                  <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm px-3 py-1.5 rounded-full mb-4">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Free forever — no credit card
                  </div>
                  <h1 className="text-4xl font-black leading-tight">
                    Your child's Caribbean
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500"> adventure</span>
                    {' '}starts today
                  </h1>
                  <p className="text-white/60 mt-3 text-lg">
                    Join 500+ Caribbean families. Free access to games, stories, and cultural adventures — forever.
                  </p>
                </div>

                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <div>
                    <label className="block text-white/70 text-sm font-medium mb-1.5">Your email address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3.5 text-white placeholder-white/30 focus:outline-none focus:border-yellow-400/60 focus:ring-2 focus:ring-yellow-400/20 transition text-base"
                    />
                  </div>

                  {error && <p className="text-red-400 text-sm">{error}</p>}

                  <button
                    type="submit"
                    className="w-full py-4 rounded-xl font-black text-[#060D1F] text-lg bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 transition shadow-lg shadow-orange-500/30"
                  >
                    Start My Free Account →
                  </button>

                  <p className="text-center text-white/30 text-xs">
                    No credit card required · Cancel anytime · Join 500+ Caribbean families
                  </p>
                </form>

                {/* Character showcase */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4 transition-all">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-400/20 to-orange-500/20 border border-yellow-400/20 flex items-center justify-center text-3xl">
                    {char.emoji}
                  </div>
                  <div>
                    <p className="text-white font-bold">{char.name} is waiting for your child</p>
                    <p className="text-white/50 text-sm">Teaches {char.subject} through Caribbean adventures</p>
                  </div>
                </div>
              </div>
            )}

            {/* Step: Personalize */}
            {step === 'personalize' && (
              <div className="space-y-6">
                <div>
                  <div className="text-3xl mb-2">🌴</div>
                  <h2 className="text-3xl font-black">Almost there!</h2>
                  <p className="text-white/60 mt-1">Tell us a little about your child so we can personalize their adventure.</p>
                </div>

                <form onSubmit={handlePersonalize} className="space-y-4">
                  <div>
                    <label className="block text-white/70 text-sm font-medium mb-1.5">Your name</label>
                    <input
                      type="text"
                      value={parentName}
                      onChange={e => setParentName(e.target.value)}
                      placeholder="e.g. Michelle"
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3.5 text-white placeholder-white/30 focus:outline-none focus:border-yellow-400/60 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-white/70 text-sm font-medium mb-1.5">Child's name <span className="text-white/30">(optional)</span></label>
                    <input
                      type="text"
                      value={childName}
                      onChange={e => setChildName(e.target.value)}
                      placeholder="e.g. Zara"
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3.5 text-white placeholder-white/30 focus:outline-none focus:border-yellow-400/60 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-white/70 text-sm font-medium mb-1.5">Your Caribbean heritage 🏝️</label>
                    <select
                      value={island}
                      onChange={e => setIsland(e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-yellow-400/60 transition"
                    >
                      <option value="" className="bg-[#0D1B35]">Select your island...</option>
                      {ISLANDS.map(i => (
                        <option key={i} value={i} className="bg-[#0D1B35]">{i}</option>
                      ))}
                    </select>
                    <p className="text-white/30 text-xs mt-1">We'll personalize stories with your island's culture</p>
                  </div>

                  {error && <p className="text-red-400 text-sm">{error}</p>}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 rounded-xl font-black text-[#060D1F] text-lg bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 disabled:opacity-60 disabled:cursor-not-allowed transition shadow-lg shadow-orange-500/30"
                  >
                    {loading ? '✨ Setting up your account...' : 'Enter the Islands →'}
                  </button>
                </form>
              </div>
            )}

            {/* Step: Success */}
            {step === 'success' && (
              <div className="text-center space-y-6 py-8">
                <div className="text-6xl animate-bounce">🎉</div>
                <h2 className="text-3xl font-black">Welcome to Likkle Legends!</h2>
                <p className="text-white/60">
                  {childName ? `${childName}'s` : 'Your'} Caribbean adventure is ready.
                  Taking you to the island now...
                </p>
                <div className="flex justify-center">
                  <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Right — Social Proof ────────────────────────────────────── */}
        <div className="hidden lg:flex flex-col justify-center bg-[#0A1628] border-l border-white/10 w-[420px] shrink-0 px-10 py-20 space-y-10">

          {/* What's included */}
          <div>
            <h3 className="text-white font-bold text-lg mb-5">What's included — free forever:</h3>
            <div className="space-y-3">
              {[
                { icon: '🎮', text: 'First level of every game — Island Hop, Math Market, Spelling Blaze, Tanty\'s Kitchen' },
                { icon: '📖', text: 'Caribbean storybooks narrated by R.O.T.I., Tanty Spice & friends' },
                { icon: '🎵', text: 'Tanty Radio — Caribbean educational songs for kids' },
                { icon: '🖨️', text: '3 free printable worksheets every month' },
                { icon: '🌍', text: 'Stories personalized to your island heritage' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-xl mt-0.5 shrink-0">{item.icon}</span>
                  <p className="text-white/70 text-sm leading-snug">{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Upgrade teaser */}
          <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-400/20 rounded-2xl p-5">
            <p className="text-yellow-400 font-bold text-sm mb-1">Want even more?</p>
            <p className="text-white/60 text-sm">Upgrade to Premium ($4.99/mo) for full game access, all stories, monthly mail kits, and AI-powered learning plans.</p>
          </div>

          {/* Testimonial */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 transition-all">
            <p className="text-white/80 text-sm italic mb-3">"{testimonial.quote}"</p>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-[#060D1F] font-black text-sm">
                {testimonial.author[0]}
              </div>
              <div>
                <p className="text-white text-sm font-semibold">{testimonial.author}</p>
                <p className="text-white/40 text-xs">{testimonial.location}</p>
              </div>
            </div>
          </div>

          {/* Trust row */}
          <div className="flex items-center gap-4 text-white/40 text-xs">
            <span>🔒 Secure</span>
            <span>🚫 Ad-free</span>
            <span>✅ Safe for kids</span>
            <span>🏝️ Caribbean-made</span>
          </div>
        </div>
      </div>
    </div>
  );
}
