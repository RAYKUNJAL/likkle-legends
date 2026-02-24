import { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import NotificationBar from '@/components/landing/NotificationBar';
import VideoHero from '@/components/landing/VideoHero';
import ParentEmotionalHook from '@/components/landing/ParentEmotionalHook';
import SocialProofStrip from '@/components/landing/SocialProofStrip';
import LandingCharacters from '@/components/landing/LandingCharacters';
import HowItWorks from '@/components/HowItWorks';
import Features from '@/components/Features';
import LandingPricing from '@/components/landing/LandingPricing';
import FAQ from '@/components/FAQ';
import FinalCTA from '@/components/landing/FinalCTA';
import StickyMobileCTA from '@/components/landing/StickyMobileCTA';
import Footer from '@/components/Footer';
import { siteContent } from '@/lib/content';

export const metadata: Metadata = {
  title: "Likkle Legends | Caribbean Learning for Kids 4–8",
  description:
    "Help your child grow academically while staying connected to Caribbean culture — wherever you live. Stories, songs, activities and monthly character drops for kids 4-8.",
  alternates: { canonical: 'https://likklelegends.com' },
  openGraph: {
    title: "Likkle Legends | Caribbean Learning for Kids 4–8",
    description: "Join 500+ families raising proud, confident Caribbean kids.",
    images: [{ url: '/images/logo.png' }],
  },
};

export default function Page() {
  return (
    <div className="min-h-screen font-sans selection:bg-primary/20 selection:text-primary">
      {/* ─── Urgency Bar ───────────────────────────── */}
      <NotificationBar content={siteContent} />

      {/* ─── Navigation ────────────────────────────── */}
      <Navbar />

      <main>
        {/* 1. STOP THE SCROLL — Cinematic video hero with price-anchored CTA */}
        <VideoHero />

        {/* 2. MIRROR THE PAIN — Speak to parent anxiety about culture + screens */}
        <ParentEmotionalHook />

        {/* 3. BUILD TRUST — Stats, testimonials, global reach */}
        <SocialProofStrip />

        {/* 4. CHARACTERS SELL THEMSELVES — Interactive carousel with parent value props */}
        <LandingCharacters />

        {/* 5. MAKE THE VALUE CONCRETE — What's inside each month */}
        <Features />

        {/* 6. REDUCE FRICTION — 3 simple steps */}
        <HowItWorks />

        {/* 7. CLOSE THE DEAL — Pricing with guarantee */}
        <LandingPricing />

        {/* 8. HANDLE OBJECTIONS — FAQ */}
        <FAQ />

        {/* 9. FINAL CLOSE — Don't let them leave without one last CTA */}
        <FinalCTA />
      </main>

      {/* ─── Sticky Mobile CTA ─────────────────────── */}
      <StickyMobileCTA />

      {/* ─── Footer ────────────────────────────────── */}
      <Footer />
    </div>
  );
}
