import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import Pricing from '@/components/Pricing';
import Characters from '@/components/Characters';
import AnnouncementBar from '@/components/AnnouncementBar';
import TantySpiceWidget from '@/components/AIWidgets';
import Link from 'next/link';

import DigitalMagic from '@/components/DigitalMagic';
import FAQ from '@/components/FAQ';
import StoryGenerator from '@/components/StoryGenerator';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <AnnouncementBar />
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <Features />
        <DigitalMagic />
        <section id="story" className="py-24 bg-deep text-white overflow-hidden">
          <div className="container grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <span className="text-secondary font-bold uppercase tracking-widest text-sm">Building Connections</span>
              <h2 className="text-4xl lg:text-6xl font-bold leading-tight">Identity, Culture & SEL <br /> Wrapped in Fun.</h2>
              <p className="text-xl text-white/70 leading-relaxed max-w-xl">
                Too many Caribbean children grow up disconnected from their roots or unsure how to express big feelings.
                Likkle Legends brings emotional literacy and Caribbean pride straight into their hands each month.
              </p>
              <div className="space-y-4">
                <div className="flex gap-4 p-4 rounded-3xl bg-white/5 border border-white/10">
                  <div className="w-12 h-12 bg-secondary/20 rounded-2xl flex items-center justify-center shrink-0">🤝</div>
                  <div>
                    <h4 className="font-bold text-lg">Relationship Focused</h4>
                    <p className="text-sm text-white/60 text-pretty">We provide conversation starters for parents and children to bond over cultural stories.</p>
                  </div>
                </div>
                <div className="flex gap-4 p-4 rounded-3xl bg-white/5 border border-white/10">
                  <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center shrink-0">✨</div>
                  <div>
                    <h4 className="font-bold text-lg">Confidence Building</h4>
                    <p className="text-sm text-white/60 text-pretty">Kids see themselves as the "Legends" of their own stories through our personalized missions.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative aspect-square rounded-[4rem] overflow-hidden border-8 border-white/10 rotate-3 shadow-2xl">
              <img src="/images/child_reading.png" alt="Happy child" className="w-full h-full object-cover" />
            </div>
          </div>
        </section>
        <Characters />
        <StoryGenerator />
        <Pricing />

        {/* Social Proof Section */}
        <section id="testimonials" className="py-24 bg-white">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold">What Our Legends Say</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="p-10 rounded-[3rem] bg-zinc-50 border border-border italic text-lg relative">
                <span className="absolute top-8 left-8 text-6xl text-primary/20 font-serif">"</span>
                <p className="relative z-10">My daughter literally waits by the mailbox for her Likkle Legends letter. She's finally learning about her Trinidadian roots in a way that's fun and meaningful.</p>
                <div className="mt-8 flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/20 rounded-full"></div>
                  <div className="text-sm">
                    <p className="font-bold">Sarah J.</p>
                    <p className="text-deep/50">New York, USA</p>
                  </div>
                </div>
              </div>
              <div className="p-10 rounded-[3rem] bg-zinc-50 border border-border italic text-lg relative">
                <span className="absolute top-8 left-8 text-6xl text-primary/20 font-serif">"</span>
                <p className="relative z-10">The emotional literacy component is what sold me. My son is learning how to talk about his feelings while celebrating his culture. It's beautiful.</p>
                <div className="mt-8 flex items-center gap-4">
                  <div className="w-12 h-12 bg-secondary/20 rounded-full"></div>
                  <div className="text-sm">
                    <p className="font-bold">David R.</p>
                    <p className="text-deep/50">London, UK</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <FAQ />
      </main>

      <footer className="bg-deep text-white py-20">
        <div className="container grid md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2 space-y-6">
            <img src="/images/logo.png" alt="Likkle Legends" className="w-48 brightness-0 invert" />
            <p className="text-white/60 max-w-sm">
              Bringing Caribbean culture, pride, and emotional literacy to children everywhere through personalized mail and interactive AI learning.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold">Platform</h4>
            <ul className="text-white/60 space-y-2 text-sm">
              <li><Link href="#how-it-works">How It Works</Link></li>
              <li><Link href="#pricing">Pricing</Link></li>
              <li><Link href="/dashboard">Child Portal</Link></li>
              <li><Link href="/dashboard">Parent Dashboard</Link></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold">Company</h4>
            <ul className="text-white/60 space-y-2 text-sm">
              <li><Link href="#">About Us</Link></li>
              <li><Link href="#">Contact</Link></li>
              <li><Link href="#">Privacy Policy</Link></li>
              <li><Link href="#">Terms of Use</Link></li>
            </ul>
          </div>
        </div>
        <div className="container mt-20 pt-8 border-t border-white/10 text-center text-xs text-white/40">
          &copy; 2025 Island Flavors Universe – Likkle Legends Mail Club. All rights reserved.
        </div>
      </footer>

      <TantySpiceWidget />
    </div>
  );
}
